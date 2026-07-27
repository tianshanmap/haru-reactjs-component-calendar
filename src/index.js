import { useState,useEffect} from "react"
import styles from "./explorer.module.css"
import ConfirmationDialog from "./components/common/dialog/ConfirmationDialog";
import MoveCopyDialog from "./components/common/dialog/MoveCopyDialog";
import UploadDialog from "./components/common/dialog/UploadDialog";
import DownloadDialog from "./components/common/dialog/DownloadDialog";
import CreateDialog from "./components/common/dialog/CreateDialog";
import ConvertDialog from "./components/common/dialog/ConvertDialog";
import FileNameDialog from "./components/common/dialog/FileNameDialog";
import TextEditorPro from "./components/common/text_editor_pro";
import ExplorerTree from "./components/explorer_tree"
import ImageViewer from "haru-reactjs-component-imageViewer";
import UnzipDialog from "./components/common/dialog/UnzipDialog";

import api from 'haru-service-api';

var image_data = {
        "name":"",
        "parent":"",
        "list":[]
      };

function Explorer(){

    const [current, setCurrent] = useState('/');
    const [parent, setParent] = useState('/');
    const [url, setUrl] = useState("");
    const [data, setData] = useState({});
    const [list, setList] = useState([]);
    const [imageList, setImageList] = useState([]);
    const [error, setError] = useState("");
    const [flow, setFlow] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [targetMoveCopyPath, setTargetMoveCopyPath] = useState("");
    const [isExistingNotes,setIsExistingNotes] = useState(true);
    const [isFileNameDialogOpen,setIsFileNameDialogOpen] = useState(false);
    const [isUnzipDialogOpen,setIsUnzipDialogOpen] = useState(false);

    useEffect(() => {
      // 1. Declare the inner async function
      const fetchData = async () => {
        try {
          const result = await api.getRoot("/");
          setData(result);
          setList(result.files);
          console.log(result.files);
        } catch (err) {
          setError(err.message);
          console.log(err.message);
        }
      };
      // 2. Invoke the function immediately
      fetchData();
    }, []); 

    const handleNavigate = async (name) => {
      console.log("handleNavigate-name=" + name);
      setFlow("");
      setCurrent(name);
      const data = await api.getDirectory(name);
      setData(data);
      setList(data.files);
    };    
    const handleSelection = async (event) => {
      let name = event.target.getAttribute("name")
      handleNavigate(name);
    };    

    const handleView = (event) => {
      console.log("handleView::start::flow=" + flow);
      var filename = event.target.getAttribute("name");
      var parentname = event.target.getAttribute("parent");
      setCurrent(filename);
      setParent(parentname);
      if (filename.endsWith(".mp4") || filename.endsWith(".webm")){
        setFlow("video");
      } else if (filename.endsWith(".mp3") || filename.endsWith(".wav")){
        setFlow("audio");
      } else if (current.endsWith(".jpeg") || current.endsWith(".jpg") || current.endsWith(".png") || current.endsWith(".JPG")){
        image_data.list = list.filter(x => x.path.endsWith(".jpg") || x.path.endsWith(".jpeg") || x.path.endsWith(".png") || x.path.endsWith(".JPG")).map(x => x.path);
        setImageList(image_data.list);
        image_data.name = filename;
        image_data.parent = parentname;
        console.log("handleView::image_data=" + JSON.stringify(image_data));
        setFlow("image");
      } else if (filename.endsWith(".pdf")){
        setFlow("pdf");
      } else if (filename.endsWith(".notes")){
        setFlow("notes");
      }
      const filename_encoded = filename.replace(/\+/g, '%2B').replace(/\&/g, '%26');
      setUrl(api.getViewEndPoint(filename_encoded));        
      console.log("handleView::end::flow=" + flow);
    };
 
    const handleDownload = async (event) => {
        setIsDownloadDialogOpen(true);
        setCurrent(event.target.getAttribute("name"));
        const parentname = event.target.getAttribute("parent");
        const target_url = api.getDownloadEndPoint(event.target.getAttribute("name")); 
        setUrl(target_url);        
        setMessage("Are you sure to download " + event.target.getAttribute("name") + "?");
        // setFlow("")
        setParent(parentname);
    }
    function handleCopy(event){
        setIsCopyDialogOpen(true);
        setMessage("Are you sure to copy " + event.target.getAttribute("name") + "?");
        setCurrent(event.target.getAttribute("name"));
        var parentname = event.target.getAttribute("parent");
        setParent(parentname);
    }
    function handleUpload(event){
        console.log("handleUpload is called");
        setIsUploadDialogOpen(true);
        setMessage("Are you sure to upload to folder " + event.target.getAttribute("name") + "?");
        setCurrent(event.target.getAttribute("name"));
        var parentname = event.target.getAttribute("parent");
        setUrl(api.getUploadEndPoint());        
        // setFlow("delete")
        setParent(parentname);
        console.log("handleUpload is completed.");
    }
    function handleMove(event){
        setIsMoveDialogOpen(true);
        setMessage("Are you sure to move " + event.target.getAttribute("name") + "?");
        setCurrent(event.target.getAttribute("name"));
        var parentname = event.target.getAttribute("parent");
        setUrl(api.getMoveEndPoint(event.target.getAttribute("name"),parentname));        
        // setFlow("delete")
        setParent(parentname);
    }
    function handleNew(event){
        setIsCreateDialogOpen(true);
        setMessage("Are you sure to create a new folder under " + event.target.getAttribute("name") + "?");
        setCurrent(event.target.getAttribute("name"));
        var parentname = event.target.getAttribute("parent");
        setUrl(api.getCreateEndPoint(event.target.getAttribute("name"),parentname));        
        // setFlow("delete")
        setParent(parentname);
    }
    function handleNewNotes(event){
        setIsFileNameDialogOpen(true);
        setMessage("Are you sure to create a new notes under " + event.target.getAttribute("name") + "?");
        setParent(event.target.getAttribute("name"));
        setIsExistingNotes(false);
    }
    function handleSaveNotes(){
      setIsExistingNotes(true);
    }
    function handleConvert(event){
        setMessage("Are you sure to convert " + event.target.getAttribute("name") + "?");
        setCurrent(event.target.getAttribute("name"));
        var parentname = event.target.getAttribute("parent");
        setUrl(api.getCreateEndPoint(event.target.getAttribute("name"),parentname));        
        // setFlow("delete")
        setParent(parentname);
        setIsConvertDialogOpen(true);
    }
    function handleDelete(event){
        setIsDialogOpen(true);
        setMessage("Are you sure to delete " + event.target.getAttribute("name") + "?");
        setCurrent(event.target.getAttribute("name"));
        var parentname = event.target.getAttribute("parent");
        setUrl(api.getDeleteEndPoint(event.target.getAttribute("name"),parentname));        
        // setFlow("delete")
        setParent(parentname);
    }
    function handleUnzip(event){
        setIsUnzipDialogOpen(true);
        setMessage("Are you sure to unzip " + event.target.getAttribute("name") + "?");
        setCurrent(event.target.getAttribute("name"));
        var parentname = event.target.getAttribute("parent");
        setParent(parentname);
    }

    const handleDeleteDialogConfirm = async () => {
      setIsDialogOpen(false);
      console.log("Action Confirmed! Perform delete logic here.");
      const data = await api.deleteFile(current,parent);
      setData(data);
      setList(data.files);
    };
    const handleMoveDialogConfirm = async () => {
      setIsMoveDialogOpen(false);
      console.log("handleMoveDialogConfirm::Action Confirmed! Perform move logic here.");
      const data = await api.move(current,targetMoveCopyPath);
      setData(data);
      setList(data.files);
      setFlow("");
    };
    const handleCopyDialogConfirm = async () => {
      setIsCopyDialogOpen(false);
      console.log("Action Confirmed! Perform copy logic here.");
      const data = await api.copy(current,targetMoveCopyPath);
      setData(data);
      setList(data.files);
      setFlow("");
    };
    const handleUploadDialogConfirm = async () => {
      setIsUploadDialogOpen(false);
      const data = await api.getDirectory(current);
      setData(data);
      setList(data.files);
      setFlow("");
    };
    const handleDownloadDialogConfirm = async () => {
      setIsDownloadDialogOpen(false);
      setFlow("");
    };
    const handleCreateDialogConfirm = async (name) => {
      setIsCreateDialogOpen(false);
      console.log("Action Confirmed! Perform copy logic here.");
      const data = await api.createDirectory(name,current);
      setData(data);
      setList(data.files);
      setFlow("");
    };
    const handleConvertDialogConfirm = async () => {
      setIsConvertDialogOpen(false);
      console.log("handleConvertDialogConfirm,name=" + current);
      const data = await api.convertMtsToMp4(current,parent);
      setData(data);
      setList(data.files);
      setFlow("");
    };
    const handleNotesNameConfirm = async (name) => {
      if (name.endsWith("*.notes")){
        setCurrent(parent + "/" + name + ".notes");
      } else {
        setCurrent(parent + "/" + name);
      }
      setIsFileNameDialogOpen(false);
      setIsExistingNotes(false);
      setFlow("notes");
    };
    const handleUnzipConfirm = async () => {
      setIsUnzipDialogOpen(false);
      const data = await api.unzip(current,targetMoveCopyPath);
      const folder = data.targetPath;
      const folder_data = await api.getDirectory(folder);
      setData(folder_data);
      setList(folder_data.files);
      setFlow("");
    };

    
    const handleDialogCancel = () => {
      setIsDialogOpen(false);
      console.log("Action Cancelled.");
    };
    const handleMoveDialogCancel = () => {
      setIsMoveDialogOpen(false);
      console.log("Action Cancelled.");
    };
    const handleCopyDialogCancel = () => {
      setIsCopyDialogOpen(false);
      console.log("Action Cancelled.");
    };
    const handleUploadDialogCancel = () => {
      setIsUploadDialogOpen(false);
      console.log("Action Cancelled.");
    };
    const handleDownloadDialogCancel = () => {
      setIsDownloadDialogOpen(false);
      console.log("Action Cancelled.");
    };
    const handleCreateDialogCancel = () => {
      setIsCreateDialogOpen(false);
      console.log("Action Cancelled.");
    };
    const handleConvertDialogCancel = () => {
      setIsConvertDialogOpen(false);
      console.log("Action Cancelled.");
    };
    const onCancelNotesDialog = () => {
      setIsFileNameDialogOpen(false);
      console.log("Action Cancelled.");
    };
    const onCancelUnzipDialog = () => {
      setIsUnzipDialogOpen(false);
      console.log("Action Cancelled.");
    };
    
    const handlePathSelect = async (path) => {
      console.log("handlePathSelect::" + path);
      setTargetMoveCopyPath(path);
      const data = await api.getDirectory(path);
      const myOptions = data.files
        .filter(item => item.kind === "folder")
        .map(item => ({value: item.path, label: item.path}));      
      myOptions.unshift({value: "/", label: "/"});  
      myOptions.unshift({value: "none", label: "none"});  
      console.log("handlePathSelect::myOptions=" + JSON.stringify(myOptions));  
      return myOptions;
     };
    
    if (flow == "video"){
      console.log("processing video...")
      return (
        <div className="main">
          <div className={styles.video_container}>
              <button className={styles.video_button} name={parent} onClick={handleSelection}>Back</button>
              <video className={styles.video_source} width="1024" height="768" controls>
                <source src={url} type="video/mp4"/>
              </video>
          </div>
        </div>  
      )
    } else if (flow == "audio"){
      console.log("processing audio...url=" + url)
      return (
        <div className="main">
          <a href="#" name={parent} onClick={handleSelection}>Back</a>
          <audio src={url} controls>
             Your browser does not support the audio element.
          </audio>
        </div>  
      )
    } else if (flow == "delete"){
      console.log("processing delete...url=" + url)
      let message = "are you sure you want to delete " + current + "?";
      return (
        <div className="main">
          <a href="#" name={parent} onClick={handleSelection}>Back</a>
          <p>{current}</p>
          <ConfirmationDialog 
            isOpen={isDialogOpen} 
            title="Delete a File/Folder" 
            message={message}
            onConfirm={handleDeleteDialogConfirm}
            onCancel={handleDialogCancel}/>
        </div>  
      )
    } else if (flow == "image"){
      console.log("processing image...image_data=" + JSON.stringify(image_data));
      const url = "http://tianshan.ca/filesystem";
      // const name = "/Users/developer/T9/travels/processed/174-alison/jpeg/20251130_225239.jpeg";
      // const list = [
      //   "/Users/developer/T9/travels/processed/174-alison/jpeg/20251130_225239.jpeg",
      //   "/Users/developer/T9/travels/processed/174-alison/jpeg/20251202_080503.jpeg",
      //   "/Users/developer/T9/travels/processed/174-alison/jpeg/20251206_092438.jpeg",
      //   "/Users/developer/T9/travels/processed/174-alison/jpeg/20251207_121220.jpeg",
      // ];
      return (
        <ImageViewer 
          name={image_data.name}
          parent={image_data.parent}
          list={image_data.list}
          onExit={handleNavigate}
          getViewEndPoint={api.getViewEndPoint}
          />
      )
    } else if (flow == "pdf"){
      console.log("processing pdf...")
      return (
        <div className="main">
          <a href="#" name={parent} onClick={handleSelection}>Back</a>
          <object data={url} type="application/pdf" width="100%" height="700">
              <p>Your browser does not support PDFs. <a href={url}>Download the PDF</a>.</p>
          </object>
        </div>  
      )
    } else if (flow == "notes"){
      console.log("processing notes...current=" + JSON.stringify(current));
      return (
        <div className="main">
          <TextEditorPro isExisting={isExistingNotes} name={current} parent={parent} onSave={handleSaveNotes} onExit={handleNavigate}/>
        </div>  
      )
    } else {
      return (
        <div className="main">
          <div className="table-container">
            <ExplorerTree 
              data={data}
              list={list}
              handleSelection={handleSelection}
              handleDownload={handleDownload}
              handleUpload={handleUpload}
              handleCopy={handleCopy}
              handleMove={handleMove}
              handleDelete={handleDelete}
              handleNew={handleNew}
              handleNewNotes={handleNewNotes}
              handleView={handleView}
              handleConvert={handleConvert}
              handleUnzip={handleUnzip}
              />
            <ConfirmationDialog 
              isOpen={isDialogOpen} 
              title="Delete a File/Folder" 
              message={message}
              onConfirm={handleDeleteDialogConfirm}
              onCancel={handleDialogCancel}/>
            <MoveCopyDialog 
              isOpen={isMoveDialogOpen} 
              title="Move a File/Folder" 
              message={message}
              onConfirm={handleMoveDialogConfirm}
              onCancel={handleMoveDialogCancel}
              onPathSelect={handlePathSelect}/>
            <MoveCopyDialog 
              isOpen={isCopyDialogOpen} 
              title="Copy a File/Folder" 
              message={message}
              onConfirm={handleCopyDialogConfirm}
              onCancel={handleCopyDialogCancel}
              onPathSelect={handlePathSelect}/>
            <UploadDialog 
              isOpen={isUploadDialogOpen} 
              title="Upload a File" 
              message={message}
              onCancel={handleUploadDialogCancel}
              onConfirm={handleUploadDialogConfirm}
              name={current}
              remote_url={url}
              />
            <DownloadDialog 
              isOpen={isDownloadDialogOpen} 
              title="Download a File/Folder" 
              message={message}
              onCancel={handleDownloadDialogCancel}
              onConfirm={handleDownloadDialogConfirm}
              name={current}
              remote_url={url}
              />
            <CreateDialog 
              isOpen={isCreateDialogOpen} 
              title="Create a Folder" 
              message={message}
              onCancel={handleCreateDialogCancel}
              onConfirm={handleCreateDialogConfirm}
              />
            <ConvertDialog 
              isOpen={isConvertDialogOpen} 
              title="Convert MTS to mp4" 
              message={message}
              onCancel={handleConvertDialogCancel}
              onConfirm={handleConvertDialogConfirm}
              />
            {isFileNameDialogOpen &&
              <FileNameDialog
                title="Assign a name for your notes"
                message={message}
                label="Notes Name : "
                onConfirm={handleNotesNameConfirm}
                onCancel={onCancelNotesDialog}
              />             
            }
            {isUnzipDialogOpen &&
              <UnzipDialog
                title="Unzip a file"
                message={message}
                label="Notes Name : "
                onConfirm={handleUnzipConfirm}
                onCancel={onCancelUnzipDialog}
                onPathSelect={handlePathSelect}
              />             
            }
          </div>
        </div>
      );
  }
}
export default Explorer