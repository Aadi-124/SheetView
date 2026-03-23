
// export default Index;
import { useState } from "react";
import NavBar from "../components/NavBar.jsx";
import FileUpload  from "@/components/FileUpload.js";
import UniversalViewer from "@/components/UniversalViewer";
import Home from "@/components/Home.js";
import { HeightRule } from "docx";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [serverMeta, setServerMeta] = useState<any>(null);
  console.log("Stored AUTH = "+sessionStorage.getItem("app.auth"));
  return (
    <div className="">
      <NavBar />
    {/* <FileUpload/> */}
    <Home/>
      {uploadedFile && (
        <div className="h-[100vh] rounded-xl border border-border bg-card shadow-card">
          {/* <UniversalViewer file={uploadedFile} /> */}
        </div>
      )}
      <footer style={{height:"100px"}}>
        HI
      </footer>
    </div>
  );
};

export default Index;