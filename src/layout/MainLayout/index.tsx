import React, { useState } from 'react';
import { Layout, Menu, theme, Badge } from 'antd';
import classes from './index.module.less';
import { Outlet } from 'react-router-dom';
const { Header, Content } = Layout;
const menus = [{ label: '摄像头管理', key: '/home' }];

const MainLayout: React.FC = () => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const [current] = useState('/home');
    return (
        <Layout>
            <Header
                style={{
                    display: 'none',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    width: '100%',
                    alignItems: 'center',
                }}
            >
                <div className={classes['project-icon-box']}>
                    <div className="logo" />
                    <Badge.Ribbon text="内部">
                        <div>安全环保视频查看平台</div>
                    </Badge.Ribbon>
                </div>

                <div>
                    <Menu theme="dark" mode="horizontal" selectedKeys={[current]} items={menus} />
                </div>
            </Header>
            <Content className="site-layout" style={{ padding: '24px' }}>
                {/*<Breadcrumb style={{ margin: '16px 0' }}>*/}
                {/*    <Breadcrumb.Item>Home</Breadcrumb.Item>*/}
                {/*    <Breadcrumb.Item>List</Breadcrumb.Item>*/}
                {/*    <Breadcrumb.Item>App</Breadcrumb.Item>*/}
                {/*</Breadcrumb>*/}

                <div style={{ padding: 24, minHeight: 'calc(100vh - 48px)', background: colorBgContainer }}>
                    <Outlet />
                </div>
            </Content>
        </Layout>
    );
};

export default MainLayout;
