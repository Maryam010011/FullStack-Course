
import { workshops } from "./workshops.js";
import { renderWorkshops } from "./ui.js";

const listEl = document.getElementById("workshop-list");

renderWorkshops(listEl, workshops);
