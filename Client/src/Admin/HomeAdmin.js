import React, { useContext, useEffect, useState } from "react";
import { axios } from "../Utils/Axios";
import { PetContext } from "../Context/Context";
import toast from "react-hot-toast";

export default function HomeDashboard() {
  const { products = [], handlePrice } = useContext(PetContext); // Default to empty array
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("jwt_token"); // Get the token

      try {
        const usersResponse = await axios.get("http://localhost:5000/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to Authorization header
          },
        });

        if (usersResponse?.status === 200 && usersResponse?.data?.data) {
          setProfile(usersResponse.data.data);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Unauthorized. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const reversedData = Array.isArray(products) ? [...products].reverse() : [];
  const reversedProfile = Array.isArray(profile) ? [...profile].reverse() : [];

  if (loading) {
    return (
      <div className="text-center my-5">
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  return (
    <div>
      {/* Recent Products Section */}
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
            {reversedData?.length > 0 ? (
              reversedData.map((product) => (
                <tbody key={product?._id}>
                  <tr>
                    <th className="text-center">{product?.category || "N/A"}</th>
                    <th>{product?.title?.slice(0, 24) || "Untitled"}</th>
                    <th>{handlePrice(product?.price || 0)}</th>
                  </tr>
                </tbody>
              ))
            ) : (
              <tbody>
                <tr>
                  <td colSpan="3" className="text-center">
                    No products available
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Recent Users Section */}
        <div className="dashboard-table recent-admin ps-5">
          <h4>Recent Users</h4>
          <table>
            <thead>
              <tr>
                <td>Name</td>
                <td>Email</td>
              </tr>
            </thead>
            {reversedProfile?.length > 0 ? (
              reversedProfile.map((user) => (
                <tbody key={user?._id}>
                  <tr>
                    <th>{user?.name?.split(" ")[0] || "Unknown"}</th>
                    <th>{user?.email || "N/A"}</th>
                  </tr>
                </tbody>
              ))
            ) : (
              <tbody>
                <tr>
                  <td colSpan="2" className="text-center">
                    No users available
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
