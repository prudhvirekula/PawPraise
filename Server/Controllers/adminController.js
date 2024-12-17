const { User } = require('../Models/userSchema');
const { Product, productValidationSchema } = require('../Models/productSchema');
const Order = require('../Models/orderSchema');
const jwt = require('jsonwebtoken');

module.exports = {
  login: async (req, res) => {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const accessToken = jwt.sign({ email }, process.env.ADMIN_ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
      const refreshToken = jwt.sign({ email }, process.env.USER_REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
      res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });

      res.status(200).json({
        status: 'success',
        message: 'Successfully Logged In.',
        data: { jwt_token: accessToken, name: process.env.ADMIN_NAME },
      });
    } else {
      res.status(401).json({ message: 'Access denied. Incorrect password.' });
    }
  },

  getAllUsers: async (req, res) => {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'User collection is empty.',
        data: [],
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched user datas.',
      data: users,
    });
  },

  getUserById: async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id).populate({
      path: 'orders',
      populate: {
        path: 'products',
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched user data.',
      data: user,
    });
  },

  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      if (products.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'Product collection is empty!',
          data: [],
        });
      }
      res.status(200).json({
        status: 'success',
        message: 'Successfully fetched product details.',
        data: products,
      });
    } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).json({ message: 'Failed to fetch products', error: error.message });
    }
  },
  

  getProductById: async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched product details.',
      data: product,
    });
  },

  getProductsByCategory: async (req, res) => {
    // products/category?name=men
    const categoryName = req.query.name;

    if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const products = await Product.find({ category: categoryName });
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched products details by category.',
      data: products,
    });
  },

  createProduct: async (req, res) => {
    const { error, value } = productValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { title, description, price, category, image } = value;

    try {
      await Product.create({ title, description, image, price, category });
      const updatedProducts = await Product.find();

      res.status(201).json({
        status: 'success',
        message: 'Successfully created a product.',
        data: updatedProducts,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create a product' });
    }
  },

  updateProduct: async (req, res) => {
    const { id } = req.params;
  
    // Explicitly pick only the allowed fields
    const { title, description, price, category, image } = req.body;
  
    try {
      // Validate input
      const { error } = productValidationSchema.validate({ title, description, price, category, image });
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
  
      // Find the product
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Update only the allowed fields
      if (title) product.title = title;
      if (description) product.description = description;
      if (price) product.price = price;
      if (category) product.category = category;
      if (image) product.image = image;
  
      await product.save();
  
      // Fetch updated list of products
      const updatedProducts = await Product.find({}, { __v: 0 }); // Exclude __v from response
  
      res.status(200).json({
        status: 'success',
        message: 'Successfully updated the product.',
        data: updatedProducts,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update product.' });
    }
  },  

  deleteProduct: async (req, res) => {
    const id = req.params.id;
    const product = await Product.findByIdAndRemove(id);
    if (product) {
      const updatedProducts = await Product.find();
      res.json({
        status: 'success',
        message: 'Successfully deleted a product.',
        data: updatedProducts,
      });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  },

  getOrders: async (req, res) => {
    const orders = await Order.find();

    if (orders.length == 0) {
      return res.json({ message: 'No Orders' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched order details.',
      data: orders,
    });
  },

  getStats: async (req, res) => {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalProductsSold: { $sum: { $size: '$products' } },
          totalRevenue: { $sum: { $toDouble: '$total_amount' } },
        },
      },
      { $project: { _id: 0 } },
    ]);

    if (!stats.length) {
      return res.status(200).json({
        status: 'success',
        message: 'No orders yet.',
        data: [{ totalProductsSold: 0, totalRevenue: 0 }],
      });
    }
    

    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched stats.',
      data: stats,
    });
  },
};
