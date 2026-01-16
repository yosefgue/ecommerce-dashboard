import { Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import Dashboard from "./pages/dashboard/dashboard.jsx";
import Orders from "./pages/orders/orders.jsx";
import Products from "./pages/products/products.jsx";
import Clients from "./pages/clients/clients.jsx";
import Categories from "./pages/categories/categories.jsx";
import Login from "./pages/auth/login.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="clients" element={<Clients />} />
          <Route path="categories" element={<Categories />} />
          <Route path="*" element={<div>Not found</div>} />
        </Route>
      </Route>
    </Routes>
  );
}