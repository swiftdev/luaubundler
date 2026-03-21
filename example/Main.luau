--// Showcase of all macros. 
if LBN_DEBUG then 
    print("Currently in debug mode!")
else 
    print("Currently not in debug mode!")
end 

LBN_DEBUG_GUARD()

LBN_DEBUG_GUARD()
print("This file was bundled in " .. LBN_TIME .. "ms using luaubundler " .. LBN_VERSION .. " at " .. LBN_BUILD_DATE);
print("Within the module " .. LBN_MODULE_NAME)
print("The absolute path of this module is " .. LBN_SOURCE)
print("Total number of modules registered: " .. LBN_MODULE_COUNT)
LBN_DEBUG_GUARD_END()
print("The files under the utility directory will be output below.")
for i,v in LBN_LSDIR("utils") do 
    print(i, v)
end 
print('===========================================================') 

local json = LBN_LOAD_JSON("./example.json");
local text = LBN_READ_FILE("./text.txt");

print(text)
print("The key `a` in the json file's value is: " .. json.a)

local utils = LBN_IMPORT_ALL("utils/"); 

utils.stats:info()

LBN_DEBUG_GUARD_END()

LBN_DEBUG_GUARD()
print("Out of the scope of the debug guard")
LBN_DEBUG_GUARD_END()

print("2/2")