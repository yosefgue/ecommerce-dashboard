import React, { useState } from 'react';
import style from './categories.module.css';
import { Button, Table, Space, Tooltip, Modal, Form, Input } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getcategories, savecategories } from '../../data/datafetch.js';

export default function Categories() {
  const [categories, setCategories] = useState(() => getcategories());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const dataSource = categories.map((category) => ({
    key: category.id,
    name: category.name,
  }));

  const handleDelete = (id) => {
    const updated = categories.filter((category) => category.id !== id);
    setCategories(updated);
    savecategories(updated);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
                const categoryToEdit = categories.find((c) => c.id === record.key);
                if (!categoryToEdit) return;
                setEditingCategory(categoryToEdit);
                form.setFieldsValue({
                  name: categoryToEdit.name,
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

  const handleSaveCategory = (values) => {
    let updated;

    if (editingCategory) {
      updated = categories.map((category) =>
        category.id === editingCategory.id
          ? { ...category, name: values.name }
          : category,
      );
    } else {
      const nextId = categories.length
        ? Math.max(...categories.map((c) => c.id)) + 1
        : 1;

      const newCategory = {
        id: nextId,
        name: values.name,
      };

      updated = [...categories, newCategory];
    }

    setCategories(updated);
    savecategories(updated);
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  return (
    <div className={style.container}>
      <div style={{ marginBottom: 16, textAlign: 'left' }}>
        <Button
          type="primary"
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          New Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? 'Edit Category' : 'New Category'}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={editingCategory ? 'Save' : 'Create'}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveCategory}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
