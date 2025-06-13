import React from "react";

 function BannedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-10 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-700 mb-6">
          You are unable to access this webpage.
        </p>
        <img
          src="https://cdn-icons-png.flaticon.com/512/463/463612.png"
          alt="Banned"
          className="mx-auto w-24 h-24 mb-4"
        />
      </div>
    </div>
  );
} export default BannedPage;