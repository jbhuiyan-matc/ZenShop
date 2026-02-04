import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold mb-4">Welcome to ZenShop</h1>
      <p className="text-lg text-gray-600 mb-8">Secure, Fast, and Reliable E-Commerce</p>
      <Link to="/products" className="bg-neutral-900 text-white px-6 py-3 rounded-md hover:bg-neutral-700 transition-colors">
        Browse Products
      </Link>
    </div>
  );
};

export default Home;
