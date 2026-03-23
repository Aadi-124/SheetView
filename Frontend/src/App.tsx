// // import { Toaster } from "@/components/ui/toaster";
// // import { Toaster as Sonner } from "@/components/ui/sonner";
// // import { TooltipProvider } from "@/components/ui/tooltip";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // import { BrowserRouter, Routes, Route } from "react-router-dom";
// // import Index from "./pages/Index";
// // import NotFound from "./pages/NotFound";
// // import { SnackbarProvider } from "notistack";
// // import Login from "./components/Login.jsx";
// // import Register from "./components/Register.jsx";
// // import NavBar from "./components/NavBar.jsx";
// // import Profile from "./components/Profile";
// // const queryClient = new QueryClient();

// // const App = () => (
// //   <QueryClientProvider client={queryClient}>
// //     <TooltipProvider>
// //       <Toaster />
// //       <Sonner />
// //         <SnackbarProvider
// //               maxSnack={3}
// //               autoHideDuration={3000}
// //               anchorOrigin={{ vertical: "top", horizontal: "right" }}
// //             >
// //       <BrowserRouter>
// //           {/* <NavBar/> */}
// //         <Routes>
// //           <Route path="/login" element={<Login/>}/>
// //           <Route path="/register" element={<Register/>}/>
// //           <Route path="/profile" element={<Profile/>}/>
          
// //           <Route path="/" element={
          
// //               <Index />
            
// //           } />
// //           <Route path="*" element={<NotFound />} />
// //         </Routes>
// //       </BrowserRouter>
// //       </SnackbarProvider>
// //     </TooltipProvider>
// //   </QueryClientProvider>
// // );

// // export default App;

// // App.tsx / App.jsx
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
// import SharedDocument from "./components/SharedDocument";
// import {getLocalAuth} from "./services/localStorageAuth.js";

// // ⬇️ Add these imports
// import FilePage from "./components/FilePage.js"; // new page we’ll create
// import UniversalViewer from "./components/UniversalViewer.js";
// import { useEffect, useState } from "react";

// const queryClient = new QueryClient();


// const App = () => {
  
//   const [username,setUsername] = useState("");

// useEffect(() => {
//   const auth = getLocalAuth();
//   console.log("AUTH =", JSON.parse(auth));
// }, []);

  
//   return(
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <SnackbarProvider
//         maxSnack={3}
//         autoHideDuration={3000}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//       >
//         <BrowserRouter>
//           {/* <NavBar/>  // keep off if you don’t want it on viewer page */}
//           <Routes>
//             <Route path="/login" element={<Login/>}/>
//             <Route path="/register" element={<Register/>}/>
//             <Route path="/profile" element={<Profile/>}/>
//             {/* <Route path="/fileView" element={<UniversalViewer/>}/> */}


//             {/* NEW: open viewer by id from query param */}
//             <Route path="/file" element={<FilePage />} />
//             <Route path="/sharedDoc" element={<SharedDocument docId="1" username="Aaditya"/>} />

//             <Route path="/" element={<Index />} />
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </SnackbarProvider>
//     </TooltipProvider>
//   </QueryClientProvider>
// );
// }
// export default App;








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
import SharedDocument from "./components/SharedDocument";
import FilePage from "./components/FilePage.js";
import UniversalViewer from "./components/UniversalViewer.js";

import { getLocalAuth } from "./services/localStorageAuth.js";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {  
    
    const raw = getLocalAuth();
    // FIX: Do not parse objects
    let auth;
    try {
      auth = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      auth = null;
    }

    console.log("AUTH =", auth);
   
    if (auth?.username) setUsername(auth.username);
  }, []);

  return (
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
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/file" element={<FilePage />} />

              {/* Pass username from logged-in user */}
              <Route
                path="/sharedDoc"
                element={<SharedDocument docId="1" username={username} />}
              />

              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;