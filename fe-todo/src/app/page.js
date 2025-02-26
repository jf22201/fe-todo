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

  const handleListChange = (e) => {
    setSelectedListIndex(e.target.value);
    setData(allData[e.target.value]);
  };
  const handleCreateNewList = () => {
    console.log("create new list");
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
    });
  };

  const handleDeleteList = async () => {
    let listid = toDoLists[selectedListIndex]?.id;
    await supabase.from("todolists").delete().eq("id", listid);
    //casading delete of tasks in DB schema handles the deletion of tasks
    //update the FE todolists
    await getToDoLists().then((res) => {
      let response = res;
      setToDoLists(response.data);
      setSelectedListIndex(0); //set the selected list to the first list
      setCurrTodoListId(response.data[0]?.id); //update listid state
      setMeetingComment(response.data[0]?.comment);
      setMeetingTime(response.data[0]?.time);
    });
  };

  //initial state setup
  useEffect(() => {
    getToDoLists().then(async (res) => {
      let response = res;
      setToDoLists(response.data);
      const taskData = await getTasks(response.data[0].id);
      setData(taskData);
      setLoading(false);
      setSelectedListIndex(0); //set the selected list to the first list
      setCurrTodoListId(response.data[0].id); //update list id state
      setMeetingComment(response.data[0].comment);
      setMeetingTime(response.data[0].time);
    });
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
      <div className="flex flex-col items-center h-screen bg-sky-100">
        <div className="flex flex-row space-x-2 ">
          <select
            className="space-x-4 p-4 rounded-2xl shadow-lg"
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
            className=" p-4 rounded-2xl shadow-lg"
          />
          <button
            className="px-2 rounded-2xl shadow-lg bg-sky-600"
            onClick={() => {
              handleCreateNewList();
            }}
          >
            Create New List
          </button>

          <button
            className="px-2 rounded-2xl shadow-lg bg-sky-600"
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
          ) : (
            <ToDo
              data={data}
              setData={setData}
              currToDoListId={currToDoListId}
              meetingComment={meetingComment}
              setMeetingComment={setMeetingComment}
              meetingTime={meetingTime}
              setMeetingTime={setMeetingTime}
            />
          )}
        </div>

        {/* <button onClick={()=>{updateDropDownSelection(1)}}>test</button> */}
      </div>
    </>
  );
}
