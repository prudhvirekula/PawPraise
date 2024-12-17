import React, { useContext, useState, useEffect } from 'react';
import { axios } from '../Utils/Axios';
import { MDBIcon } from 'mdb-react-ui-kit';
import { PetContext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';
import Button from '../Components/Button';
import toast from 'react-hot-toast';

export default function ProductsAdmin() {
  const navigate = useNavigate();
  const { products, handlePrice } = useContext(PetContext);
  const [category, setCategory] = useState(products);
  const [selectedOption, setSelectedOption] = useState('All');

  // Use useEffect to filter products based on the selected category
  useEffect(() => {
    selectedOption === 'All'
      ? setCategory(products)
      : setCategory(products.filter((product) => product.category === selectedOption));
  }, [selectedOption, products]);

  // Handle product deletion
const handleDelete = async (productID) => {
  const confirmation = window.confirm(
    'Are you sure you want to delete this product?\nThis action cannot be undone.'
  );

  if (confirmation) {
    try {
      const token = localStorage.getItem('jwt_token'); // Fetch JWT token
      if (!token) {
        toast.error('Unauthorized. Please log in again.');
        return;
      }

      const response = await axios.delete(`http://localhost:5000/api/admin/products/${productID}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to Authorization header
        },
      });

      toast.success(response.data.message || 'Product deleted successfully');
      // Optionally, refresh or update the list of products in the UI
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  }
};

  return (
    <div>
      <div className="dashboard-table products-admin px-3 py-3">
        <table>
          <thead>
            <tr>
              <td>
                <select
                  style={{ border: 'none' }}
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                </select>
              </td>
              <td>Image</td>
              <td>Name</td>
              <td>Description</td>
              <td>Price</td>
            </tr>
          </thead>
          {category.map((product) => (
            <tbody key={product._id}>
              <tr>
                <th>{product.category}</th>
                <th>
                  <img src={product.image} alt={product.title} style={{ width: '120px' }} />
                </th>
                <th>{product.title}</th>
                <th>{product.description.slice(0, 60)}</th>
                <th>{handlePrice(product.price)}</th>
                <th>
                  <Button
                    className="me-1"
                    color="success"
                    onClick={() => navigate(`/dashboard/products/${product._id}`)}
                  >
                    <MDBIcon fas icon="edit" />
                  </Button>
                </th>
                <th>
                  <Button className="me-1" color="danger" onClick={() => handleDelete(product._id)}>
                    <MDBIcon fas icon="trash" />
                  </Button>
                </th>
              </tr>
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
