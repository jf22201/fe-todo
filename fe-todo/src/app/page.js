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
  const [currToDoListId, setCurrTodoListId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meetingComment, setMeetingComment] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  //DB functions
  const getToDoLists = async () => await supabase.from("todolists").select("*");
  const getTasks = async (listid) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("todolist", listid);
    if (error) {
      console.log(error);
    }
    return data;
  };

  const createListDB = async (list) => {
    const { data, error } = await supabase
      .from("todolists")
      .insert({ list_name: list.list_name })
      .select("*"); //select statement to return the inserted row;
    //create linked meeting comment
    if (error) {
      console.log(error);
    }
    return data;
  };

  const handleListChange = async (e) => {
    setSelectedListIndex(e.target.value);
    setData(toDoLists[e.target.value]);
  };
  const handleCreateNewList = async () => {
    setLoading(true);
    let listTemplate = { list_name: newListName };
    createListDB(listTemplate).then((result) => {
      let newList = { ...listTemplate, id: result[0].id };
      setToDoLists([newList, ...toDoLists]);
      setNewListName("");
      setSelectedListIndex(0);
      setCurrTodoListId(result[0].id); //update listid state
      getTasks(result[0].id).then((res) => {
        //update the tasks list
        setData(res);
      });
      setLoading(false);
    });
  };

  const handleDeleteList = async () => {
    let listid = currToDoListId;
    setLoading(true);
    await supabase.from("todolists").delete().eq("id", listid);
    //casading delete of tasks in DB schema handles the deletion of tasks
    //update the FE todolists
    await getToDoLists().then((res) => {
      //sort the todolists by id
      let response_data = res.data;
      response_data.sort((a, b) => a.id - b.id);
      setToDoLists(response_data);
      setSelectedListIndex(0); //set the selected list to the first list
      setCurrTodoListId(response_data[0]?.id); //update listid state
      setMeetingComment(response_data[0]?.comment);
      setMeetingTime(response_data[0]?.time);
      setLoading(false);
    });
  };

  //initial state setup
  useEffect(() => {
    try {
      getToDoLists().then(async (res) => {
        let response = res;
        response.data.sort((a, b) => a.id - b.id);
        setToDoLists(response.data);
        if (response.data.length > 0) {
          // only set get task data if a todolist exists
          const taskData = await getTasks(response.data[0].id);
          setData(taskData);
          setCurrTodoListId(response.data[0].id); //update list id state
          setMeetingComment(response.data[0].comment);
          setMeetingTime(response.data[0].time);
        }
        setLoading(false);
        setSelectedListIndex(0); //set the selected list to the first list
      });
    } catch {
      console.log("error");
    }
  }, []);

  //Update the current listid if the selectedListIndex changes
  useEffect(() => {
    if (toDoLists.length > 0) {
      let listid = toDoLists[selectedListIndex]?.id;
      setCurrTodoListId(listid);
    }
  }, [selectedListIndex]);

  //update the loaded tasks whenever currToDoListId changes
  useEffect(() => {
    console.log("currToDoListId", currToDoListId);
    const updateTasks = async (listid) => {
      const taskData = await getTasks(listid);
      setData(taskData);
    };
    updateTasks(currToDoListId);
    setMeetingComment(toDoLists[selectedListIndex]?.comment);
    setMeetingTime(toDoLists[selectedListIndex]?.time);
  }, [currToDoListId]);

  //
  useEffect(() => {
    if (currToDoListId !== undefined && currToDoListId !== null) {
      getTasks(currToDoListId).then((res) => {
        let response = res;
        setData(response.data);
      });
    }
  }, [toDoLists]);
  return (
    <>
      <div className="flex flex-col items-center h-screen bg-white ">
        <div className="flex flex-row space-x-2 mt-20">
          <select
            className="space-x-4 p-4 rounded-full border"
            id="dropdown"
            value={selectedListIndex}
            onChange={(e) => {
              handleListChange(e);
            }}
          >
            {toDoLists?.map((item, index) => (
              <option value={index} key={`list${index}`} className="bg-white">
                {item.list_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Enter New List Name"
            className=" p-4 rounded-full border"
          />
          <button
            className="px-2 rounded-full  bg-black text-white border"
            onClick={() => {
              handleCreateNewList();
            }}
          >
            Create New List
          </button>

          <button
            className="px-2 rounded-full  bg-black text-white"
            onClick={handleDeleteList}
          >
            {" "}
            Delete List
          </button>
        </div>
        {/* <h1>{data?.name}</h1> */}
        <div className="py-8">
          {loading ? (
            <div>Loading...</div>
          ) : toDoLists?.length > 0 ? (
            <ToDo
              data={data}
              setData={setData}
              currToDoListId={currToDoListId}
              meetingComment={meetingComment}
              setMeetingComment={setMeetingComment}
              meetingTime={meetingTime}
              setMeetingTime={setMeetingTime}
            />
          ) : (
            <div>Create a new list!</div>
          )}
        </div>

        {/* <button onClick={()=>{updateDropDownSelection(1)}}>test</button> */}
      </div>
    </>
  );
}
