import style from './dashboard.module.css';
import { useState } from 'react';
import { getdailystats, getorders, getproducts, getcategories } from '../../data/seedextract.js';
import { Select } from 'antd';
import { Line, Column, Pie, Scatter } from '@ant-design/charts';

export default function Dashboard() {
    const [range, setRange] = useState(7); // days: 7, 30, 90

    const allStats = getdailystats();
    const allOrders = getorders();
    const allProducts = getproducts();
    const allCategories = getcategories();

    const sortedStats = [...allStats].sort((a, b) => a.date.localeCompare(b.date));
    const sortedOrders = [...allOrders].sort((a, b) => a.date.localeCompare(b.date));

    let ordersLineData = [];
    let visitorsData = [];
    let conversionData = [];
    let soldByCategory = [];
    let countryPoints = [];
    let totalVisitors = 0;
    let totalOrders = 0;
    let totalRevenue = 0;
    let conversionRate = 0;

    if (sortedStats.length > 0) {
        const lastStatsDate = sortedStats[sortedStats.length - 1].date;
        let refDate = lastStatsDate;

        if (sortedOrders.length > 0) {
            const lastOrderDate = sortedOrders[sortedOrders.length - 1].date;
            refDate = lastStatsDate < lastOrderDate ? lastStatsDate : lastOrderDate;
        }

        const end = new Date(refDate);
        const start = new Date(refDate);
        start.setDate(start.getDate() - (range - 1));
        const startDate = start.toISOString().slice(0, 10);
        const endDate = end.toISOString().slice(0, 10);

        const statsSlice = sortedStats.filter(
            (stat) => stat.date >= startDate && stat.date <= endDate,
        );

        const ordersSlice = sortedOrders.filter(
            (order) => order.date >= startDate && order.date <= endDate,
        );

        const ordersByDate = {};
        statsSlice.forEach((stat) => {
            ordersByDate[stat.date] = {
                date: stat.date,
                orders: 0,
                revenue: 0,
            };
            visitorsData.push({ date: stat.date, visitors: stat.visitors });
            totalVisitors += stat.visitors || 0;
        });

        const paidOrders = [];

        ordersSlice.forEach((order) => {
            if (!ordersByDate[order.date]) {
                ordersByDate[order.date] = {
                    date: order.date,
                    orders: 0,
                    revenue: 0,
                };
            }
            const value =
                typeof order.total === 'number'
                    ? order.total
                    : Number(order.total) || 0;
            ordersByDate[order.date].orders += 1;
            ordersByDate[order.date].revenue += value;

            if ((order.paymentStatus || '').toLowerCase() === 'paid') {
                paidOrders.push(order);
                totalRevenue += value;
            }
        });

        totalOrders = paidOrders.length;
        conversionRate = totalVisitors
            ? (totalOrders / totalVisitors) * 100
            : 0;

        const orderedDates = Object.values(ordersByDate).sort((a, b) =>
            a.date.localeCompare(b.date),
        );

        ordersLineData = [
            ...orderedDates.map((item) => ({
                date: item.date,
                metric: 'Orders',
                value: item.orders,
            })),
            ...orderedDates.map((item) => ({
                date: item.date,
                metric: 'Revenue',
                value: item.revenue,
            })),
        ];

        let totalAddToCart = 0;
        let totalCheckout = 0;
        statsSlice.forEach((stat) => {
            totalAddToCart += stat.addToCart || 0;
            totalCheckout += stat.checkout || stat.checkouts || 0;
        });

        conversionData = [
            { type: 'Add to cart', value: totalAddToCart },
            { type: 'Checkout', value: totalCheckout },
            { type: 'Orders', value: totalOrders },
        ];

        const productToCategory = {};
        allProducts.forEach((product) => {
            productToCategory[product.id] = product.categoryId;
        });

        const categoryIdToName = {};
        allCategories.forEach((cat) => {
            categoryIdToName[cat.id] = cat.name;
        });

        const soldByCategoryMap = {};
        ordersSlice.forEach((order) => {
            order.items.forEach((item) => {
                const categoryId = productToCategory[item.productId];
                if (!categoryId) return;
                const name = categoryIdToName[categoryId] || 'Other';
                if (!soldByCategoryMap[name]) soldByCategoryMap[name] = 0;
                soldByCategoryMap[name] += item.qty || 1;
            });
        });

        soldByCategory = Object.keys(soldByCategoryMap).map((name) => ({
            name,
            count: soldByCategoryMap[name],
        }));

        const ordersByCountryMap = {};
        ordersSlice.forEach((order) => {
            const country = order.country || 'Unknown';
            if (!ordersByCountryMap[country]) {
                ordersByCountryMap[country] = { country, orders: 0 };
            }
            ordersByCountryMap[country].orders += 1;
        });

        countryPoints = Object.values(ordersByCountryMap);
    }

    const lineConfig = {
        data: ordersLineData,
        xField: 'date',
        yField: 'value',
        seriesField: 'metric',
        smooth: true,
        height: 260,
    };

    const visitorsConfig = {
        data: visitorsData,
        xField: 'date',
        yField: 'visitors',
        columnWidthRatio: 0.6,
        height: 260,
    };

    const pieConfig = {
        data: conversionData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.6,
    };

    const categoryPieConfig = {
        data: soldByCategory,
        angleField: 'count',
        colorField: 'name',
        radius: 0.8,
    };

    const countryScatterConfig = {
        data: countryPoints,
        xField: 'country',
        yField: 'orders',
        size: 6,
        colorField: 'country',
    };

    return (
        <div className={style.container}>
            <div className={style.controls}>
                <Select
                    value={range}
                    style={{ width: 180 }}
                    onChange={setRange}
                    options={[
                        { value: 7, label: 'Last 7 days' },
                        { value: 30, label: 'Last 30 days' },
                        { value: 90, label: 'Last 90 days' },
                    ]}
                />
            </div>

            <div className={style.grid}>
                <div className={style.card}>
                    <h3 className={style.title}>Orders & Revenue (daily)</h3>
                    <div>
                        <div className={style.summaryLabel}>Total orders</div>
                        <div className={style.summaryValue}>{totalOrders}</div>
                        <div className={style.summaryLabel}>Total revenue</div>
                        <div className={style.summaryValue}>
                            ${totalRevenue.toLocaleString()}
                        </div>
                    </div>
                    <div className={style.chart}>
                        <Line {...lineConfig} />
                    </div>
                </div>

                <div className={style.card}>
                    <h3 className={style.title}>Visitors (daily)</h3>
                    <div>
                        <div className={style.summaryLabel}>Total visitors</div>
                        <div className={style.summaryValue}>
                            {totalVisitors.toLocaleString()}
                        </div>
                    </div>
                    <div className={style.chart}>
                        <Column {...visitorsConfig} />
                    </div>
                </div>

                <div className={style.card}>
                    <h3 className={style.title}>Conversion (range)</h3>
                    <div>
                        <div className={style.summaryLabel}>Conversion rate</div>
                        <div className={style.summaryValue}>
                            {conversionRate.toFixed(1)}%
                        </div>
                    </div>
                    <div className={style.chart}>
                        <Pie {...pieConfig} />
                    </div>
                </div>
            </div>

            <div className={style.grid}>
                <div className={style.card}>
                    <h3 className={style.title}>Sales by category</h3>
                    <div className={style.chart}>
                        <Pie {...categoryPieConfig} />
                    </div>
                </div>
                <div className={style.card}>
                    <h3 className={style.title}>Orders by country</h3>
                    <div className={style.chart}>
                        <Scatter {...countryScatterConfig} />
                    </div>
                </div>
            </div>
        </div>
    );
}