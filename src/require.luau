local __modules = {}; 
local __cache   = {};
local __require = setmetatable({}, {
    __call = function (this, module) 
        if __cache[module] ~= nil then 
            return __cache[module]
        end 

        local mod = __modules[module];
        if not mod then
            if __debug then
                error("Missing module " .. module)                 
            end 

            return nil; 
        end 

        __cache[module] = true; 
        local res = mod();
        __cache[module] = res 

        return res; 
    end 
});