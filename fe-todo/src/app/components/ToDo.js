import { M_PLUS_1 } from "next/font/google";
import React, { useState, useEffect } from "react";
import supabase from "../../../utils/supabase/supabaseClient";

const ToDo = ({ data, setData, currToDoListId }) => {
  const [taskInputName, setTaskInputName] = useState("");
  const [sortedData, setSortedData] = useState([]);
  const updateTaskDB = async (task) => {
    await supabase.from("tasks").update(task).eq("id", task.id);
  };
  const createTaskDB = async (task) => {
    console.log("task", task);
    const { data, error } = await supabase
      .from("tasks")
      .insert([task])
      .select("*"); //return the details of the row inserted
    if (error) {
      console.log(error);
    }
    return data;
  };

  const deleteTaskDB = async (task) => {
    //delete the selected task
    await supabase.from("tasks").delete().eq("id", task.id);
    //update the position of tasks with position greater than current - this is a function defined on the database
    await supabase.rpc("update_positions", {
      deleted_position: task.position,
      todolistid: task.todolist,
    });
  };

  const toggleCompletedDB = async (task) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);
    if (error) {
      console.error("Error updating task", error);
      return null;
    }
    return data;
  };

  useEffect(() => {
    let temp = data;
    temp.sort((a, b) => a.position - b.position);
    setSortedData(temp);
  }, []);
  //effect to update listLength when data changes
  useEffect(() => {
    //update sortedData when data changes
    if (data) {
      console.log("data", data);
      let temp = [...data];
      temp.sort((a, b) => a.position - b.position);
      setSortedData(temp);
    }
  }, [data]);

  const decreasePosition = (index) => {
    console.log("decposition data", data);
    let temp = structuredClone(data); //deepcopy
    [temp[index].position, temp[index - 1].position] = [
      temp[index - 1].position,
      temp[index].position,
    ]; //switch position values between tasks
    temp.sort((a, b) => a.position - b.position); //re-sort based on position attribute
    setData(temp);
  };

  const increasePosition = (index) => {
    console.log(data);
    let temp = structuredClone(data); //deepcopy
    [temp[index].position, temp[index + 1].position] = [
      temp[index + 1].position,
      temp[index].position,
    ]; //switch position values between tasks
    updateTaskDB(temp[index]);
    updateTaskDB(temp[index + 1]);
    setData(temp);
  };

  const buttonRendering = (item, index) => {
    //console.log('buttonrender',item)
    if (data?.length === 1) {
      return null; //show no buttons if only one item in list
    }
    if (index === 0) {
      return <button onClick={() => increasePosition(index)}>v</button>;
    }
    if (index === data?.length - 1) {
      return <button onClick={() => decreasePosition(index)}>^</button>;
    }
    return (
      <div className="space-x-2">
        <button onClick={() => increasePosition(index)}>v</button>
        <button onClick={() => decreasePosition(index)}>^</button>
      </div>
    );
  };
  const handleToggleCompleted = async (index, checked) => {
    let task = data[index];
    await toggleCompletedDB(task)
      .then((_) => {
        let newData = [...data];
        newData[index].completed = checked;
        setData(newData);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleDelete = async (index) => {
    const taskToDelete = data[index];
    //perform operations on DB first
    await deleteTaskDB(taskToDelete)
      .then((_) => {
        let filteredData = [
          ...data.filter((task) => task.id !== taskToDelete.id),
        ]; //select all except the task to delete
        setData(filteredData);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const taskAdd = async () => {
    let taskTemplate = {
      task: taskInputName,
      completed: false,
      todolist: currToDoListId,
      position: data.length,
    };
    await createTaskDB(taskTemplate)
      .then((result) => {
        let newTask = { ...taskTemplate, id: result[0].id }; //get id from the result of the createTaskDB function
        setData((prevData) => {
          return [...prevData, newTask];
        }); //add new task to list
        setTaskInputName(""); //clear input field
      })
      .catch((error) => {
        console.log(error);
      });
  };
  if (data?.length === 0) {
    return (
      <div>
        <p>No tasks!</p>
        <AddTaskComponent
          taskInputName={taskInputName}
          taskAdd={taskAdd}
          setTaskInputName={setTaskInputName}
        />
      </div>
    );
  }
  return (
    <div>
      <div className="flex flex-col">
        {sortedData?.map((item, index) => {
          return (
            <div key={item.id} className="flex flex-row space-x-2">
              <div>{item.task}</div>
              {buttonRendering(item, index)}
              {/* <button></button> */}
              <input
                type="checkbox"
                checked={item.completed}
                onChange={(e) => handleToggleCompleted(index, e.target.checked)}
              />
              <button onClick={() => handleDelete(index)}>Delete</button>
            </div>
          );
        })}
      </div>
      <AddTaskComponent
        taskInputName={taskInputName}
        taskAdd={taskAdd}
        setTaskInputName={setTaskInputName}
      />
    </div>
  );
};

export default ToDo;

const AddTaskComponent = ({ taskInputName, taskAdd, setTaskInputName }) => {
  return (
    <div className="flex flex-row space-x-2">
      <input
        type="text"
        value={taskInputName}
        onChange={(e) => setTaskInputName(e.target.value)}
        placeholder="Enter Task"
      />
      <button onClick={taskAdd}>Add Task</button>
    </div>
  );
};
