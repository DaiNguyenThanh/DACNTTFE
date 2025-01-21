import React from "react";
import styled from "@emotion/styled";
import { Draggable } from "react-beautiful-dnd";
import { Badge, Col, Row,Typography } from 'antd';
const {Text}=Typography
const Container = styled("div")`
  border: 1px solid lightgrey;
  margin-bottom: 8px;
  border-radius: 2px;
  padding: 8px;
  background: ${props => (props.isDragging ? "lightgreen" : "white")};
`;

const Task = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index} type="task">
      {(provided, snapshot) => (
        <Container
          ref={provided.innerRef}
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          isDragging={snapshot.isDragging}
        >
          <Row justify="space-between">
            <Col >
              <div>{task.title}</div>
              <Text type="secondary">{task.deadline}</Text>
            </Col>
            <Col >

              <Badge
                count={task.priority}
                style={{ backgroundColor: task.priority === 'high' ? '#f5222d' : task.priority === 'medium' ? '#faad14' : '#52c41a' }}
              />
            </Col>
          </Row>

        

        </Container>
      )}
    </Draggable>
  );
};

export default Task;
