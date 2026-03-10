// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";
// import { SnackbarProvider } from "notistack";
// import Login from "./components/Login.jsx";
// import Register from "./components/Register.jsx";
// import NavBar from "./components/NavBar.jsx";
// import Profile from "./components/Profile";
// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//         <SnackbarProvider
//               maxSnack={3}
//               autoHideDuration={3000}
//               anchorOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//       <BrowserRouter>
//           {/* <NavBar/> */}
//         <Routes>
//           <Route path="/login" element={<Login/>}/>
//           <Route path="/register" element={<Register/>}/>
//           <Route path="/profile" element={<Profile/>}/>
          
//           <Route path="/" element={
          
//               <Index />
            
//           } />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//       </SnackbarProvider>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;

// App.tsx / App.jsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SnackbarProvider } from "notistack";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import NavBar from "./components/NavBar.jsx";
import Profile from "./components/Profile";

// ⬇️ Add these imports
import FilePage from "./components/FilePage.js"; // new page we’ll create

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <BrowserRouter>
          {/* <NavBar/>  // keep off if you don’t want it on viewer page */}
          <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/profile" element={<Profile/>}/>

            {/* NEW: open viewer by id from query param */}
            <Route path="/file" element={<FilePage />} />

            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
