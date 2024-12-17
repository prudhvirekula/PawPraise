import React, { useContext, useEffect, useState } from "react";
import { axios } from "../Utils/Axios";
import { PetContext } from "../Context/Context";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Radio, TextArea } from "../Components/Input";
import Button from "../Components/Button";
import toast from "react-hot-toast";

export default function EditProductAdmin() {
  const { id } = useParams();
  const { setProductDetails } = useContext(PetContext);
  const [item, setItem] = useState({ title: "", description: "", price: "", category: "", image: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("jwt_token");
        if (!token) {
          toast.error("Unauthorized. Please log in again.");
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItem(response.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch product details.");
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const handleForm = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      toast.error("Unauthorized. Please log in again.");
      return;
    }
  
    // Create a copy of the item without _id
    const { _id, ...updatedItem } = item;
  
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/products/${id}`, // Pass product ID in URL
        updatedItem, // Send updated item without _id
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.status === 200) {
        toast.success(response.data.message || "Product updated successfully");
        setProductDetails(response.data.data);
        navigate("/dashboard/products");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product.");
    }
  };
  
  return (
    <div className="d-flex justify-content-center">
      <form
        onSubmit={handleForm}
        className="dashboard-table px-5"
        style={{ width: "800px" }}
      >
        <h2 className="text-center">Edit Product</h2>
        <div className="w-100 pt-4">
          {/* Category */}
          <div className="mt-3 mb-3 text-center">
            <label className="me-3 text-black">Category: </label>
            {["Cat", "Dog"].map((category) => (
              <Radio
                key={category}
                label={category}
                value={category}
                name="category"
                onChange={handleInputChange}
                checked={item.category === category}
              />
            ))}
          </div>

          {/* Title */}
          <Input
            type="text"
            label="Title"
            name="title"
            value={item.title}
            onChange={handleInputChange}
          />

          {/* Description */}
          <TextArea
            label="Description"
            name="description"
            value={item.description}
            onChange={handleInputChange}
          />

          {/* Price */}
          <Input
            type="number"
            label="Price"
            name="price"
            value={item.price}
            min={1}
            onChange={handleInputChange}
          />

          {/* Image URL */}
          <Input
            type="text"
            label="Image URL"
            name="image"
            value={item.image}
            onChange={handleInputChange}
          />

          {/* Image Preview */}
          {item.image && (
            <div className="text-center my-3">
              <img
                src={item.image}
                alt="Product Preview"
                style={{ width: "200px", height: "auto", borderRadius: "10px" }}
              />
            </div>
          )}

          <div className="text-center">
            <Button type="submit" className="mb-4 w-50" color="black">
              Submit
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
