// import { useState } from "react";
// import { FileSpreadsheet } from "lucide-react";
// import FileUpload  from "@/components/FileUpload";
// import { DataTable } from "@/components/DataTable";
// import { ShimmerTable } from "@/components/ShimmerTable";
// import { ThemeToggle } from "@/components/ThemeToggle";
// import NavBar from "../components/NavBar.jsx";

// const Index = () => {
//   const [data, setData] = useState<Record<string, string>[] | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileLoaded = (rows: Record<string, string>[]) => {
//     setLoading(true);
//     // Brief shimmer effect
//     setTimeout(() => {
//       setData(rows);      // populate table data
//       setLoading(false);  // stop loading
//     }, 800);
//   };

//   return (
//     <div className=""  >
//       <NavBar/>
//       {/* Header */}
//       {/* Main */}
     
//         {/* Upload Section: show only if no data */}
//         {data === null && (
//             <div className="rounded-xl border border-border bg-card p-2 shadow-card" style={{"border":"2px solid red","height":"100vh"}}>
             
//               <FileUpload onFileLoaded={handleFileLoaded} />
//             </div>
//         )}

//         {/* Table Section */}
//         {/* {(data || loading) && (
//           <section className="">
//             <div className="">
//               <h2 className="">
//                 Data
//               </h2>
//               {loading ? (
//                 <ShimmerTable />
//               ) : data ? (
//                 // <DataTable data={data} onDataChange={setData} />
//                 <DataTable/>
//               ) : null}
//             </div>
//           </section>
//         )} */}
//          {/* {(data || loading) && (
//                 !loading && <DataTable/>

                
//         )} */}


//       {/* Footer */}
//       <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
//         Excel Viewer & Editor — Built with FastAPI + React
//       </footer>
//     </div>
//   );
// };

// export default Index;
import { useState } from "react";
import NavBar from "../components/NavBar.jsx";
import FileUpload  from "@/components/FileUpload.js";
import UniversalViewer from "@/components/UniversalViewer";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [serverMeta, setServerMeta] = useState<any>(null);
  console.log("Stored AUTH = "+sessionStorage.getItem("app.auth"));
  return (
    <div className="">
      <NavBar />

      {/* Upload view (shown until a file is uploaded) */}
      {/* {!uploadedFile && (
        <div
          className="rounded-xl border border-border bg-card p-2 shadow-card"
          style={{height: "100vh" }}
        >
          <FileUpload
            onUploadComplete={(file, meta) => {
              setUploadedFile(file);
              setServerMeta(meta);
            }}
          />
        </div>
      )} */}
    <FileUpload/>
      {/* Viewer area (shows after upload) */}
      {uploadedFile && (
        <div className="h-[100vh] rounded-xl border border-border bg-card shadow-card">
          {/* <UniversalViewer file={uploadedFile} /> */}
        </div>
      )}
    </div>
  );
};

export default Index;