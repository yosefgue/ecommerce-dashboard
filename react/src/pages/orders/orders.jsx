import style from './orders.module.css';
import { useState } from 'react';
import { Table, Tag, Select } from 'antd';
import { getorders, getclients, saveorders } from '../../data/seedextract.js';

function formatDate(date) {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
}
const clients = getclients();
const clientmap = clients.reduce((acc, client) => {
    acc[client.id] = client.name;
    return acc;
}, {});

export default function Orders() {
    const [orders, setOrders] = useState(() => getorders());

    const sortedOrders = [...orders].sort((a, b) => b.id - a.id);

    const handleFulfillChange = (id, newStatus) => {
        const updated = orders.map((order) =>
            order.id === id
                ? { ...order, fulfillmentStatus: newStatus }
                : order,
        );
        setOrders(updated);
        saveorders(updated);
    };

    const dataSource = sortedOrders.map((order) => ({
        key: order.id,
        id: order.id,
        client: clientmap[order.clientId] || '',
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        totalAmount: order.total,
        orderDate: formatDate(order.date),
    }));

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => `#${id}`,
        },
        {
            title: 'Client',
            dataIndex: 'client',
            key: 'client',
        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            filters: [
                { text: 'Paid', value: 'paid' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value, record) =>
                record.paymentStatus.toLowerCase() === value,
            render: (status) => {
                const value = status.toLowerCase();

                if (value === 'cancelled') {
                    return (
                        <Tag
                            color="orange"
                            style={{
                                borderRadius: '999px',
                                border: 'none',
                                padding: '0 12px',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                            }}
                        >
                            Cancelled
                        </Tag>
                    );
                }
                else if (value === 'paid') {
                    return (
                        <Tag
                            color="darkgreen"
                            style={{
                                borderRadius: '999px',
                                padding: '0 12px',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                            }}
                        >
                            Paid
                        </Tag>
                    );
                }
                else {
                    return 0;
                }
            },
        },
        {
            title: 'Fulfillment Status',
            dataIndex: 'fulfillmentStatus',
            key: 'fulfillmentStatus',
            filters: [
                { text: 'Unfulfilled', value: 'unfulfilled' },
                { text: 'Fulfilled', value: 'fulfilled' },
            ],
            onFilter: (value, record) =>
                record.fulfillmentStatus.toLowerCase() === value,
            render: (value, record) => (
                <Select
                    size="medium"
                    value={value}
                    style={{ width: 130 }}
                    onChange={(newValue) => handleFulfillChange(record.id, newValue)}
                    options={[
                        { value: 'unfulfilled', label: 'Unfulfilled' },
                        { value: 'fulfilled', label: 'Fulfilled' },
                    ]}
                />
            ),
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (value) => `$${value}`,
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
        }
    ]

    return (
        <div className={style.container}>
            <Table dataSource={dataSource} columns={columns} />
        </div>
    )
}