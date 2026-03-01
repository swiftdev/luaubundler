local Print = require('Utility/Print');
local Math  = require('Utility/Math');
local Aim   = require('Features/Aimbot'); 
Print("The result of the floor is: " .. Math.floor(5 / 3.5 * 12)); 
Print("The result of the ceil  is: " .. Math.ceil(5 / 3.5 * 12)); 

Aim:Toggle(true);

Print("The current status of the aimbot is: " .. tostring(Aim:Status())) 