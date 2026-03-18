--// Showcase of all macros. 
if LBN_DEBUG then 
    print("Currently in debug mode!")
else 
    print("Currently not in debug mode!")
end 

print("This file was bundled in " .. LBN_TIME .. "ms using luaubundler " .. LBN_VERSION .. " at " .. LBN_BUILD_DATE);
print("Within the module " .. LBN_MODULE_NAME)
print("The absolute path of this module is " .. LBN_SOURCE)
print("Total number of modules registered: " .. LBN_MODULE_COUNT)

print("The files under the utility directory will be output below.")
for i,v in LBN_LSDIR("utils") do 
    print(i, v)
end 
print('===========================================================') 

local json = LBN_LOAD_JSON("./example.json");

print("The key `a` in the json file's value is: " .. json.a)

local utils = LBN_IMPORT_ALL("utils"); 

utils.stats:info(); 


