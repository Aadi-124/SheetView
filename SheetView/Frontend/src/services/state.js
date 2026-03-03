// import {create} from 'zustand';


// const useStore = create((set)=>({
//     username : '',
//     isLoggedIn : false
// }));

// export {useStore};



import { create } from "zustand";

const useStore = create((set) => ({
  username: "Sample",
  isLoggedIn: false,
  login: (name) => set({ username: name, isLoggedIn: true }),
  logout: () => set({ username: "", isLoggedIn: false }),
}));

export { useStore };








