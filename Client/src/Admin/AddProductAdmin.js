import React, { useContext, useState } from "react";
import { axios } from "../Utils/Axios";
import { PetContext } from "../Context/Context";
import { useNavigate } from "react-router-dom";
import { Input, Radio, TextArea } from "../Components/Input";
import Button from "../Components/Button";
import toast from "react-hot-toast";

export default function AddProductAdmin() {
  const navigate = useNavigate();
  const { setProductDetails } = useContext(PetContext);
  const [item, setItem] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({ ...prevItem, [name]: value }));
  };

  const handleForm = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt_token"); // Retrieve token from localStorage
    if (!token) {
      toast.error("Unauthorized. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/products",
        item,
        {
          headers: { Authorization: `Bearer ${token}` }, // Include token in headers
        }
      );

      if (response?.status === 201 && response?.data) {
        toast.success(response.data.message || "Product added successfully");
        setProductDetails(response.data.data || []);
        navigate("/dashboard/products");
      } else {
        toast.error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error while adding product:", error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <form
        className="dashboard-table px-5"
        style={{ width: "80%" }}
        onSubmit={handleForm}
      >
        <h2 className="text-center">Add Product</h2>
        <div className="d-flex justify-content-evenly">
          <div className="w-50 pt-4 ms-5">
            <div className="mt-3 mb-3 text-center">
              <label className="me-3 text-black">Category: </label>
              {["Cat", "Dog"].map((category) => (
                <Radio
                  key={category}
                  label={category}
                  value={category}
                  name="category"
                  onChange={handleInputChange}
                />
              ))}
            </div>
            <Input
              type="text"
              label="Title"
              name="title"
              value={item.title}
              onChange={handleInputChange}
            />
            <TextArea
              label="Description"
              name="description"
              value={item.description}
              onChange={handleInputChange}
            />
            <Input
              type="number"
              label="Price"
              name="price"
              value={item.price}
              min={1}
              onChange={handleInputChange}
            />
            <Input
              type="text"
              label="Image URL"
              name="image"
              value={item.image}
              onChange={handleInputChange}
            />
            <div className="text-center">
              <Button type="submit" className="mb-4 w-50" color="black">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
