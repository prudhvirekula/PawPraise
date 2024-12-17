const { User, userRegisterSchema, userLoginSchema } = require('../Models/userSchema');
const { Product } = require('../Models/productSchema');
const Order = require('../Models/orderSchema');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
let orderDetails = {};

module.exports = {
  register: async (req, res) => {
    const { error, value } = userRegisterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = value;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! You can now login.',
    });
  },

  login: async (req, res) => {
    const { error, value } = userLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email not found. Please register.' });
    }

    const passwordMatch = bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect Password. Try again.' });
    }

    const accessToken = jwt.sign({ email }, process.env.USER_ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
    const refreshToken = jwt.sign({ email }, process.env.USER_REFRESH_TOKEN_SECRET, { expiresIn: '3d' });

    res
      .status(200)
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .json({
        status: 'success',
        message: 'Successfully Logged In.',
        data: { jwt_token: accessToken, name: user.name, userID: user._id },
      });
  },

  getProfile: async (req, res) => {
    const userID = req.params.id;
  
    const user = await User.findById(userID).select('-password').populate('orders').populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched user profile',
      data: {
        name: user.name,
        email: user.email,
        cart: user.cart,
        wishlist: user.wishlist,
        orders: user.orders,
      },
    });
  },
  

  getAllProducts: async (req, res) => {
    const products = await Product.find();
    if (products.length == 0) {
      return res.json({ message: 'Product collection is empty!' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched products detail.',
      data: products,
    });
  },

  getProductById: async (req, res) => {
    const productID = req.params.id;
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched product details.',
      data: product,
    });
  },

  getTopSellingProducts: async (req, res) => {
    const DogFood = await Product.find({ category: 'Dog' }).limit(4);
    const CatFood = await Product.find({ category: 'Cat' }).limit(4);
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched products.',
      data: [...DogFood, ...CatFood],
    });
  },

  getProductsByCategory: async (req, res) => {
    const category = req.params.categoryname;
    const products = await Product.find({ category });
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched products details.',
      data: products,
    });
  },


  addReview: async (req, res) => {
    const productID = req.params.id;
    //const userID = req.body.userID; // Extract user ID from request
    const { userID, rating, review } = req.body;
  
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
  
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
  
    const existingReview = product.reviews.find((r) => r.user.toString() === userID);
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
  
    product.reviews.push({ user: userID, rating, review });
    await product.save();
  
    res.status(200).json({
      status: 'success',
      message: 'Review added successfully',
      data: product,
    });
  },
  

  // getReviews: async (req, res) => {
  //   const productID = req.params.id;
  //   const product = await Product.findById(productID).populate('reviews.user', 'name email');
  //   if (!product) {
  //     return res.status(404).json({ message: 'Product not found' });
  //   }
  
  //   res.status(200).json({
  //     status: 'success',
  //     message: 'Successfully fetched reviews',
  //     data: product.reviews,
  //   });
  // },

  getReviews: async (req, res) => {
    const productID = req.params.id;
    
    try {
      const product = await Product.findById(productID).populate({
        path: 'reviews.user', // Populate the `user` field in the reviews
        select: 'name email', // Only include `name` and `email` fields
      });
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json({
        status: 'success',
        message: 'Successfully fetched reviews',
        data: product.reviews,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch reviews',
        error: error.message,
      });
    }
  },
  
  addComment: async (req, res) => {
    const { productId, reviewId } = req.params;
    const { userID, text } = req.body;
  
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }
  
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const review = product.reviews.id(reviewId); // Find the specific review
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      const user = await User.findById(userID);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Add the comment to the review
      review.comments.push({
        user: userID,
        text,
      });
  
      await product.save();
  
      res.status(200).json({
        status: 'success',
        message: 'Comment added successfully',
        data: review.comments, // Return updated comments
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to add comment',
        error: error.message,
      });
    }
  },


  getComments: async (req, res) => {
    const { productId, reviewId } = req.params;
  
    try {
      const product = await Product.findById(productId).populate({
        path: 'reviews.comments.user',
        select: 'name email', // Populate user details for each comment
      });
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const review = product.reviews.id(reviewId); // Find the specific review
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      res.status(200).json({
        status: 'success',
        message: 'Successfully fetched comments',
        data: review.comments,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch comments',
        error: error.message,
      });
    }
  },  
  

  showCart: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched cart items.',
      data: user.cart,
    });
  },

  addToCart: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { productID } = req.body;
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await User.findByIdAndUpdate(userID, { $addToSet: { cart: { product: productID } } });

    res.status(200).json({
      status: 'success',
      message: 'Product added to cart',
      cart: user.cart,
    });
  },

  updateCartItemQuantity: async (req, res) => {
    const userID = req.params.id;
    const { id, quantityChange } = req.body;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedCart = (user.cart.id(id).quantity += quantityChange);
    if (updatedCart > 0) {
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Cart item quantity updated',
      data: user.cart,
    });
  },

  removeFromCart: async (req, res) => {
    const userID = req.params.id;
    const productID = req.params.product;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(userID, { $pull: { cart: { product: productID } } });
    res.status(200).json({
      status: 'success',
      message: 'Successfully removed from cart',
    });
  },

  showWishlist: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched wishlist.',
      data: user.wishlist,
    });
  },

  addToWishlist: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { productID } = req.body;
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(userID, { $addToSet: { wishlist: productID } }, { new: true });
    res.status(200).json({
      status: 'success',
      message: 'Successfully added to wishlist',
      data: updatedUser.wishlist,
    });
  },

  removeFromWishlist: async (req, res) => {
    const userID = req.params.id;
    const productID = req.params.product;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(userID, { $pull: { wishlist: productID } });
    res.status(200).json({
      status: 'success',
      message: 'Successfully removed from wishlist',
    });
  },

  payment: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.cart.length === 0) {
      return res.status(404).json({ message: 'Cart is empty' });
    }

    const line_items = user.cart.map((item) => {
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            images: [item.product.image],
            name: item.product.title,
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/payment/cancel',
    });

    orderDetails = {
      userID,
      user,
      newOrder: {
        products: user.cart.map((item) => new mongoose.Types.ObjectId(item.product._id)),
        order_id: Date.now(),
        payment_id: session.id,
        total_amount: session.amount_total / 100,
      },
    };

    res.status(200).json({
      status: 'success',
      message: 'Stripe Checkout session created',
      sessionId: session.id,
      url: session.url,
    });
  },

  success: async (req, res) => {
    const { userID, user, newOrder } = orderDetails;

    if (newOrder) {
      const order = await Order.create({ ...newOrder });
      await User.findByIdAndUpdate(userID, { $push: { orders: order._id } });
      orderDetails.newOrder = null;
    }
    user.cart = [];
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment was successful',
    });
  },

  cancel: async (req, res) => {
    res.status(200).json({
      status: 'failure',
      message: 'Payment was cancelled',
    });
  },

  showOrders: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID).populate('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userOrders = user.orders;
    if (userOrders.length === 0) {
      return res.status(404).json({ message: 'You have no orders' });
    }

    const orderDetails = await Order.find({ _id: { $in: userOrders } }).populate('products');

    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched order details.',
      data: orderDetails,
    });
  },
};
