"use client";
import { useState, useEffect } from "react";
import ToDo from "./components/ToDo";
import { withCoalescedInvoke } from "next/dist/lib/coalesced-function";
import supabase from "../../utils/supabase/supabaseClient";
import todolists from "./test/page";

export default function Page() {
  //react states
  const [createdNewList, setCreatedNewList] = useState(false);
  const [allData, setAllData] = useState([]);
  const [selectedListIndex, setSelectedListIndex] = useState(0);
  const [data, setData] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [toDoLists, setToDoLists] = useState([]);
  const [currToDoListId,setCurrTodoListId] = useState(0);
  const getToDoLists = async () => await supabase.from("todolists").select("*");
  const getTasks = async (listid) =>
    await supabase.from("tasks").select("*").eq("todolist", listid);

  const handleListChange = (e) => {
    setSelectedListIndex(e.target.value);
    setData(allData[e.target.value]);
  };
  const handleCreateNewList = () => {
    console.log("create new list");
    // let newAllData = structuredClone(allData);
    // newAllData.push({ list: [], currID: 1, name: newListName });
    // setAllData(newAllData);
    setAllData((prevData) => {
      let update = [{ list: [], currID: 1, name: newListName }, ...prevData];
      setNewListName("");
      setSelectedListIndex(0);
      return update;
    });

    // setCreatedNewList(true);
  };
  // useEffect(() => {
  //   console.log("allData", allData);
  //   if (createdNewList) {
  //     setCreatedNewList(false);
  //     setSelectedListIndex(allData.length - 1);
  //   }
  // }, [allData, createdNewList]);


  //load the 
  useEffect(() => {
    getToDoLists().then((res) => {
      let response = res;
      setToDoLists(response.data);
    });
  }, []);

  // useEffect(() => {
  //   console.log("todolists", toDoLists);
  // }, [toDoLists]);
  // useEffect(() => {
  //   console.log("data", data);
  // }, [data]);


  //Update the tasks loaded depedning on the selected todolist
  useEffect(() => {
    let listid = toDoLists[selectedListIndex]?.id;
    if (listid !== undefined && listid !== null) {
      setData(getTasks(listid).data);
    }
    setCurrTodoListId(listid)//update listid state
  }, [selectedListIndex]);

  // useEffect(() => {
  //   console.log(allData);
  // }, [allData]);

  useEffect(() => {
    let listid = toDoLists[selectedListIndex]?.id;
    console.log("listid", listid);
    if (listid !== undefined && listid !== null) {
      getTasks(listid).then((res) => {
        let response = res;
        setData(response.data);
      });
    }
  }, [toDoLists]);
  return (
    <div>
      <div className="flex flex-row space-x-2">
        <select
          id="dropdown"
          value={selectedListIndex}
          onChange={(e) => {
            handleListChange(e);
          }}
        >
          {toDoLists?.map((item, index) => (
            <option value={index} key={`list${index}`}>
              {item.list_name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Enter New List Name"
        />
        <button
          onClick={() => {
            handleCreateNewList();
          }}
        >
          Create New List
        </button>
      </div>
      <h1>{data?.name}</h1>
      <ToDo data={data} setData={setData} currToDoListId={currToDoListId}/>
      {/* <button onClick={()=>{updateDropDownSelection(1)}}>test</button> */}
    </div>
  );
}
