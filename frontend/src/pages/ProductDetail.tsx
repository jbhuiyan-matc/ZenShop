import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Product Details</h1>
      <p className="text-gray-600">Displaying details for product ID: {id}</p>
    </div>
  );
};

export default ProductDetail;
