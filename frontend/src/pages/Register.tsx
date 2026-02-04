const Register = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="Enter your name" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input type="email" className="w-full px-3 py-2 border rounded-md" placeholder="Enter your email" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input type="password" className="w-full px-3 py-2 border rounded-md" placeholder="Create a password" />
        </div>
        <button className="w-full bg-neutral-900 text-white py-2 rounded-md hover:bg-neutral-700 transition-colors">
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Register;
