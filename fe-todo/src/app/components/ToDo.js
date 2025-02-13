import { M_PLUS_1 } from 'next/font/google';
import React,{useState,useEffect} from 'react';
import supabase from '../../../utils/supabase/supabaseClient';



const ToDo = ({data,setData}) => {
    const [taskInputName,setTaskInputName] = useState('');
    const [sortedData,setSortedData] = useState([]);
    const updateTaskDB = async (task) => {
        await supabase.from('tasks').update(task).eq('id',task.id);
    }
    const createTaskDB = async (task) => { await supabase.from('tasks').insert([task]);
    }
    useEffect(()=>{
        let temp = data
        temp.sort((a,b)=>a.position-b.position);
        setSortedData(temp);
    },[]);

    useEffect(()=>{ //effect to update listLength when data changes
        console.log(data); // debugging
        //update sortedData when data changes
        let temp = [...data];
        temp.sort((a,b)=>a.position-b.position);
        setSortedData(temp);

    },[data]);

    const decreasePosition = (index) => {
        let temp = structuredClone(data);//deepcopy
        [temp[index].position,temp[index-1].position] = [temp[index-1].position,temp[index].position] //switch position values between tasks
        temp.sort((a,b)=>a.position-b.position);//re-sort based on position attribute
        setData(temp);

    }

    const increasePosition = (index) => {
            let temp = structuredClone(data);//deepcopy
            [temp[index].position,temp[index+1].position] = [temp[index+1].position,temp[index].position] //switch position values between tasks
            updateTaskDB(temp[index]);
            updateTaskDB(temp[index+1]);
            setData(temp);
    };

    const buttonRendering = (item,index)=>{
        //console.log('buttonrender',item)
        if (data?.length === 1){
            return null;//show no buttons if only one item in list
        }
        if (index === 0){
            return (
                <button onClick={()=>increasePosition(index)}>v</button>
            )
        }
        if (index === data?.length - 1){
            return (
                <button onClick={()=>decreasePosition(index)}>^</button>
            )
        }
        return (
            <div className='space-x-2'>
                <button onClick={()=>increasePosition(index)}>v</button>
                <button onClick={()=>decreasePosition(index)}>^</button>
            </div>
        )
    }
    const handleCheck = (index,checked) => {
    let newData = [...data];
    newData[index].completed = checked;
    setData(newData);
    }
    const handleDelete = (item) => {
        console.log('delete',item);
    setData({...data, list:data?.list?.filter((i) => i.id !== item.id)});//select all except the one to delete
    }
    const taskAdd = () => {
        let newTask = {task:taskInputName,id:data.currID,completed:false};
        setData({...data,list:[...data.list,newTask],currID:data.currID+1}); //add new task to list and increment currID
        setTaskInputName(''); //clear input field
    }

    return(
        <div>
            <div className='flex flex-col'>
                {sortedData?.map((item,index)=>{
                    return (
                    <div key={item.id} className='flex flex-row space-x-2'>
                    <div >{item.task}</div>
                    {buttonRendering(item,index)}
                    {/* <button></button> */}
                    <input type='checkbox' checked={item.completed} onChange={(e) => handleCheck(index, e.target.checked)} />
                    <button onClick={()=>handleDelete(item)}>Delete</button>
                    </div>
                    )
                    
                })}
        </div>
        <div className ='flex flex-row space-x-2'>
                <input type='text' value={taskInputName} onChange={(e)=>setTaskInputName(e.target.value)} placeholder='Enter Task' />
                <button onClick={taskAdd}>Add Task</button>
        </div>       
        </div>
    )

    
    
    

    
}

export default ToDo;