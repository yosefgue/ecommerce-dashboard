import React, { useState } from 'react';
import style from './products.module.css';
import { Button, Table, Space, Tooltip, Modal, Form, Input, Select, InputNumber } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getproducts, getcategories, saveproducts } from '../../data/seedextract.js';

export default function Products() {
    const [categories] = useState(() => getcategories());

    const categorymap = categories.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
    }, {});

    const [products, setProducts] = useState(() => getproducts());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

    const dataSource = products.map((product) => ({
        key: product.id,
        title: product.name,
        category: categorymap[product.categoryId] || '',
        price: product.price,
        stock: product.stock,
    }));

    const handleDelete = (id) => {
        const updated = products.filter((product) => product.id !== id);
        setProducts(updated);
        saveproducts(updated);
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 450,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 200,
            filters: categories.map((category) => ({
                text: category.name,
                value: category.name,
            })),
            onFilter: (value, record) => record.category === value,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 200,
            sorter: (a, b) => a.price - b.price,
            sortDirections: ['ascend', 'descend'],
            render: (value) => `$${value}`,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            width: 200,
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
                                const productToEdit = products.find(
                                    (p) => p.id === record.key,
                                );
                                if (!productToEdit) return;
                                setEditingProduct(productToEdit);
                                form.setFieldsValue({
                                    name: productToEdit.name,
                                    categoryId: productToEdit.categoryId,
                                    price: productToEdit.price,
                                    stock: productToEdit.stock,
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

    const handleAddProduct = (values) => {
        let updated;

        if (editingProduct) {
            updated = products.map((product) =>
                product.id === editingProduct.id
                    ? {
                          ...product,
                          name: values.name,
                          categoryId: values.categoryId,
                          price: values.price,
                          stock: values.stock,
                      }
                    : product,
            );
        } else {
            const nextId = products.length
                ? Math.max(...products.map((p) => p.id)) + 1
                : 1;

            const newProduct = {
                id: nextId,
                name: values.name,
                categoryId: values.categoryId,
                price: values.price,
                stock: values.stock,
            };

            updated = [...products, newProduct];
        }

        setProducts(updated);
        saveproducts(updated);
        setIsModalOpen(false);
        setEditingProduct(null);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        form.resetFields();
    };

    return (
        <div className={style.container}>
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
                <Button
                    type="primary"
                    onClick={() => {
                        setEditingProduct(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    New Product
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingProduct ? 'Edit Product' : 'New Product'}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                okText={editingProduct ? 'Save' : 'Create'}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddProduct}
                >
                    <Form.Item
                        name="name"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter product title' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="categoryId"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category' }]}
                    >
                        <Select
                            options={categories.map((category) => ({
                                value: category.id,
                                label: category.name,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter a price' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="stock"
                        label="Stock"
                        rules={[{ required: true, message: 'Please enter stock' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}