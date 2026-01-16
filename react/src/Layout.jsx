import React, { useState } from 'react';
import style from './Layout.module.css';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ContainerOutlined,
  UserOutlined,
  HomeOutlined,
  ProductOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { logout } from './auth.js';


const { Header, Sider } = Layout;
export default function LayoutComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer } } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        className={style.sider}
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className={style.logoWrapper}>
          <img className={style.logo} src="/logo.png" alt="Logo" onClick={() => navigate('/')}/>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => {
            navigate(key);
          }}
          items={[
            {
              key: '/',
              icon: <HomeOutlined style={{ fontSize: '18px' }} />,
              label: 'Home',
            },
            {
              key: '/orders',
              icon: <ContainerOutlined style={{ fontSize: '18px' }} />,
              label: 'Orders',
            },
            {
              key: '/products',
              icon: <ProductOutlined style={{ fontSize: '18px' }} />,
              label: 'Products',
            },
            {
              key: '/clients',
              icon: <UserOutlined style={{ fontSize: '18px' }} />,
              label: 'Clients',
            },
            {
              key: '/categories',
              icon: <AppstoreOutlined style={{ fontSize: '18px' }} />,
              label: 'Categories',
            }
          ]}
        />
      </Sider>
      <Layout className={style.right}>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '18px',
              width: 64,
              height: 64,
            }}
          />
          <div className={style.avatarWrapper}>
            <Avatar size={40} src="/penguin.png" />
            <p>Admin</p>
            <Button
              type="link"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Header>
        <div className={style.content}>
            <Outlet />
        </div>
      </Layout>
    </Layout>
  );
};