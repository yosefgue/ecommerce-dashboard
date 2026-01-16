import React, { useState } from 'react';
import style from './clients.module.css';
import { Button, Table, Space, Tooltip, Modal, Form, Input } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getclients, saveclients } from '../../data/seedextract.js';

export default function Clients() {
    const [clients, setClients] = useState(() => getclients());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [form] = Form.useForm();

    const dataSource = clients.map((client) => ({
        key: client.id,
        name: client.name,
        email: client.email,
    }));

    const handleDelete = (id) => {
        const updated = clients.filter((client) => client.id !== id);
        setClients(updated);
        saveclients(updated);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Edit">
                        <EditOutlined
                            style={{ cursor: 'pointer', fontSize: '16px' }}
                            onClick={() => {
                                const clientToEdit = clients.find((c) => c.id === record.key);
                                if (!clientToEdit) return;
                                setEditingClient(clientToEdit);
                                form.setFieldsValue({
                                    name: clientToEdit.name,
                                    email: clientToEdit.email,
                                });
                                setIsModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <DeleteOutlined
                            style={{ cursor: 'pointer', color: '#ff4d4f', fontSize: '16px' }}
                            onClick={() => handleDelete(record.key)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleSaveClient = (values) => {
        let updated;

        if (editingClient) {
            updated = clients.map((client) =>
                client.id === editingClient.id
                    ? { ...client, name: values.name, email: values.email }
                    : client,
            );
        } else {
            const nextId = clients.length
                ? Math.max(...clients.map((c) => c.id)) + 1
                : 1;

            const newClient = {
                id: nextId,
                name: values.name,
                email: values.email,
            };

            updated = [...clients, newClient];
        }

        setClients(updated);
        saveclients(updated);
        setIsModalOpen(false);
        setEditingClient(null);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        form.resetFields();
    };

    return (
        <div className={style.container}>
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
                <Button
                    type="primary"
                    onClick={() => {
                        setEditingClient(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    New Client
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingClient ? 'Edit Client' : 'New Client'}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                okText={editingClient ? 'Save' : 'Create'}
            >
                <Form form={form} layout="vertical" onFinish={handleSaveClient}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter client name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter client email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}