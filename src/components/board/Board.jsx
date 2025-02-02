import React, { useState, useCallback, useEffect, useContext } from "react";
import { useParams } from 'react-router-dom';

import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import moment from "moment";
import './Board.css'
import Column from "./Column";
import { GetWorkspaceDetailAPI } from "../../api/workspaceApi";
import { GetAllTasks } from "../../api/TaskApi";
import { useWorkspace } from "../../contexts/WorkspaceProvider";
import { useForm } from "antd/es/form/Form";
import { UpdatePosition } from "../../api/TaskApi";
import { UpdateTaskStage } from "../../api/TaskApi";

const Container = styled("div")`
  display: flex;
  background-color: ${(props) => (props.isDraggingOver ? "#639ee2" : "#f4f5f7")};
  padding: 8px;
  gap: 8px;
  max-height: 85vh;
  min-width:300px
`;

const App = ({ filters }) => {
  const [starter, setStarter] = useState({ tasks: {}, columns: {}, columnOrder: [] });
  const [isLoading, setIsLoading] = useState(false);
  const { addTaskForm } = useForm();
  const { noMember, assignedToMe, noDates, overdue, dueNextDay, low, medium, high } = filters;
  const { workspaceId } = useParams();
  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      if (!workspaceId) return;
      setIsLoading(true);

      try {
        const response = await GetWorkspaceDetailAPI(workspaceId);
        const stages = response.data.stages || [];
        const deadline_from =moment().format("DD/MM/YYYY")
        const deadline_to = moment().format("DD/MM/YYYY")
        let priotiry = "low"
        const status = false
        const assignee_ids=[]
        const collaborator_ids=[]
        // if (noDates) {
        //   deadline_from = undefined;
        //   deadline_to = undefined;
        // } else if (dueNextDay) {
        //   deadline_from = new Date();
        //   deadline_to.setDate(deadline_to.getDate() + 1); // Cộng thêm 1 ngày
        // }
        if(low){
          priotiry = "low"
        }
        if(medium){
          priotiry = "medium"
        }
        if(high){
          priotiry = "high"
        }
        // Thêm logic để query API với deadline
        const allTasks = await Promise.all(
          stages.map((stage) =>
            GetAllTasks(stage.id,assignee_ids,collaborator_ids, deadline_from, deadline_to,priotiry,status).catch(() => [])
          ) // Trả về mảng rỗng nếu API lỗi
        );


        // Chuyển đổi dữ liệu API sang định dạng starter
        const tasks = {};
        const columns = {};
        const columnOrder = [];
        stages.forEach((stage, index) => {
          const stageTasks = allTasks[index].data;
          // Gắn tasks vào object tasks
          stageTasks.forEach((task) => {
            tasks[task.id] = { id: task.id, title: task.title, deadline: task.deadline, priority: task.priority };
          });

          // Gắn cột vào object columns
          columns[stage.id] = {
            id: stage.id,
            title: stage.name,
            taskIds: stageTasks.map((task) => task.id), // Lưu trữ taskIds cho từng column

          };

          // Lưu thứ tự cột
          columnOrder.push(stage.id);
        });

        setStarter({ tasks, columns, columnOrder });
      } catch (error) {
        console.error("Error fetching workspace details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaceDetails();
  }, [workspaceId, noDates, dueNextDay,low,medium,high]);

  const onDragEnd = useCallback(async ({ destination, source, draggableId, type }) => {
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      // Kéo thả cột
      const newOrder = Array.from(starter.columnOrder);
      newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, draggableId);

      setStarter((prev) => ({
        ...prev,
        columnOrder: newOrder,
      }));
      return;
    }

    const start = starter.columns[source.droppableId];
    const end = starter.columns[destination.droppableId];

    if (start === end) {
      // Kéo thả task trong cùng cột
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      setStarter((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));

      // Gửi API cập nhật vị trí
      const newPosition = destination.index; // Vị trí mới
      let position;
      let preTaskId
      if (newPosition === 0) {
        position = 'top'; // Nếu là task đầu tiên
      } else if (newPosition === newTaskIds.length - 1) {
        position = 'bottom'; // Nếu là task cuối cùng
      } else {
        position = 'middle'; // Nếu ở giữa
        preTaskId = newTaskIds[destination.index - 1] || null;
      }

      await UpdatePosition(draggableId, position, preTaskId); // Gọi API với position
      return;
    } else {
      // Kéo thả task giữa các cột
      const startTaskIds = Array.from(start.taskIds);
      const endTaskIds = Array.from(end.taskIds);

      startTaskIds.splice(source.index, 1);
      endTaskIds.splice(destination.index, 0, draggableId);

      const newStartColumn = {
        ...start,
        taskIds: startTaskIds,
      };

      const newEndColumn = {
        ...end,
        taskIds: endTaskIds,
      };

      setStarter((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newStartColumn.id]: newStartColumn,
          [newEndColumn.id]: newEndColumn,
        },
      }));

      // Gửi API cập nhật vị trí và stage
      const newPosition = destination.index; // Vị trí mới
      let position;
      let preTaskId;
      if (newPosition === 0) {
        position = 'top'; // Nếu là task đầu tiên
      } else if (newPosition === endTaskIds.length - 1) {
        position = 'bottom'; // Nếu là task cuối cùng
      } else {
        position = 'middle'; // Nếu ở giữa
        preTaskId = endTaskIds[destination.index - 1] || null; // ID của task trước đó
      }

      const stageId = end.id; // ID của stage mới

      await UpdateTaskStage(draggableId, position, preTaskId, stageId); // Gọi API với position và stage_id
    }
  }, [starter]);

  const updateColumns = () => {
    // Cập nhật lại state columns
    setStarter((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
      },
    }));
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-column" type="column" direction="horizontal">
        {(provided, snapshot) => (
          <Container
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {starter.columnOrder.map((columnId, index) => {
              const column = starter.columns[columnId];
              const tasks = column.taskIds.map((taskId) => starter.tasks[taskId]);

              return (
                <Column
                  key={column.id}
                  index={index}
                  column={column}
                  tasks={tasks}
                  form={addTaskForm}
                  starter={starter}
                  updateColumns={updateColumns}
                />
              );
            })}
            {provided.placeholder}
          </Container>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default App;
