import React, { useState } from "react";
import { Layout, theme } from "antd";
import TopNavigation from "../topNav/TopNavigation";
import LeftMenu from "../leftMenu/LeftMenu";
// import Footer from "./Footer";
import { Outlet } from "react-router-dom";
const { Content } = Layout;
const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{height:"100vh"}}>
      {/* Header */}
      <LeftMenu />

      {/* Body */}
      <Layout>
        <TopNavigation />
        <Layout>
          <Content
          
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      {/* Footer */}
      {/* <Footer /> */}
    </Layout>
  );
};
export default App;
