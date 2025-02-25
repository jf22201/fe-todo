"use client";
import supabase from "../../../utils/supabase/supabaseClient";
// import BlobImageDisplay from "./BlobToImage";
import React, { useState, useEffect } from "react";

export default async function todolists() {
  const { data: tasks } = await supabase.from("tasks").select("*");
  return <pre>{JSON.stringify(tasks, null, 2)}</pre>;
}
