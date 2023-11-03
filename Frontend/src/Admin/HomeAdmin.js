import React, { useContext, useEffect, useState } from "react";
import { MDBIcon } from "mdb-react-ui-kit";
import { PetContext } from "../App";
import axios from 'axios'

export default function HomeDashboard() {
  const { productDetails, handlePrice } = useContext(PetContext);
  const [profile, setProfile] = useState([])

  useEffect(() => {
    const fetchData = async () => {
       try {
          const response = await axios.get("http://localhost:8000/api/admin/users");
          if (response.status === 200) {
            setProfile(response.data.data);
          }
       } catch (error) {
          alert(error.response.data.message);
       }
    };

    fetchData();
 }, []);
  
  // Reverse product details and user profiles for display as recent
  const reversedData = [...productDetails].reverse();
  const reversedProfile = [...profile].reverse();

  // Calculate the total sum of orders across all users
  const totalSum = profile.reduce((sum, user) => {
    if (user.orders) {
      const orderTotal = user.orders.reduce((orderSum, order) => {
        return orderSum + order.price * order.quantity;
      }, 0);
      return sum + orderTotal;
    }
    return sum;
  }, 0);

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center gap-5 mb-5">
        <div className="content-box">
          <h6>Total Orders</h6>
          <h2>{handlePrice(totalSum)}</h2>
          <p className="text-success">
            <MDBIcon fas icon="chart-line" className="me-2" />
            {Math.round(Math.random() * 100) / 10}%{" "}
            <span className="text-muted"> Last Month</span>
          </p>
        </div>

        <div className="content-box">
          <h6>Total Products</h6>
          <h2>{productDetails.length}</h2>
          <p className="text-success">
            <MDBIcon fas icon="chart-line" className="me-2" />
            {Math.round(Math.random() * 100) / 10}%{" "}
            <span className="text-muted"> Last Month</span>
          </p>
        </div>

        <div className="content-box">
          <h6>Total Users</h6>
          <h2>{profile.length}</h2>
          <p className="text-success">
            <MDBIcon fas icon="chart-line" className="me-2" />
            {Math.round(Math.random() * 100) / 10}%{" "}
            <span className="text-muted"> Last Month</span>
          </p>
        </div>
      </div>
      <div className="dashboard-recent d-flex justify-content-center">
        <div className="dashboard-table recent-admin ps-5">
          <h4>New Products</h4>
          <table>
            <thead>
              <tr>
                <td>Category</td>
                <td>Name</td>
                <td>Price</td>
              </tr>
            </thead>
            {reversedData.map((product) => (
              <tbody key={product._id}>
                <tr>
                  <th className="text-center">{product.category}</th>
                  <th>{product.title.slice(0, 24)}</th>
                  <th>{handlePrice(product.price)}</th>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
        <div className="dashboard-table recent-admin ps-5">
          <h4>Recent Users</h4>
          <table>
            <thead>
              <tr>
                <td>Name</td>
                <td>Email</td>
              </tr>
            </thead>
            {reversedProfile.map((user) => (
              <tbody key={user._id}>
                <tr>
                  <th>{user.name.split(" ")[0]}</th>
                  <th>{user.email}</th>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
}
