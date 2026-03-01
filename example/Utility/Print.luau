local Math = require('./Math');
local Aim  = require('../Features/Aimbot')
return setmetatable({}, {
    __call = function (this, message)
        print(message)
    end 
})