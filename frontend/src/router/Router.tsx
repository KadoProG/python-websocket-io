import { Home } from "@/components/pages/Home";
import { JoinAndCreateHost } from "@/components/pages/JoinAndCreateHost";
import { Room } from "@/components/pages/Room";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/c" element={<JoinAndCreateHost />} />
      <Route path="/c/room" element={<Room />} />
    </Routes>
  </BrowserRouter>
);
