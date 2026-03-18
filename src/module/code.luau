local LBN_MODULES = {}; 
local LBN_CACHE   = {};
local LBN_REQUIRE = setmetatable({}, {
    __call = function (this, module) 
        if LBN_CACHE[module] ~= nil then 
            return LBN_CACHE[module]
        end 

        if module:sub(-5) == ".luau" then 
            module = module:sub(1, #module - 5)
        end 

        if module:sub(-4) == ".lua" then 
            module = module:sub(1, #module - 4)
        end 

        local mod = LBN_MODULES[module];
        if not mod then
            if LBN_DEBUG then
                error("Missing module " .. module)                 
            end 

            return nil; 
        end 

        LBN_CACHE[module] = true; 
        local res = mod();
        LBN_CACHE[module] = res 

        return res; 
    end 
});