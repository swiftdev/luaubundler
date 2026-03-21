--[[
	Bundled using Luaubundler v1.1.4
	Github repo: https://github.com/swiftdev/luaubundler
	Discord: https://discord.gg/2aNwJ66MVE
	Build date: 21/03/2026, 15:22:58
	Time taken: 6.00ms
--]]

local LBN_MODULES = {}; 
local LBN_CACHE = {};
local LBN_REQUIRE = setmetatable({}, {
	__call = function (this, module)
		if LBN_CACHE[module] ~= nil then
			return LBN_CACHE[module]
		end
		if module:sub(- 5) == ".luau" then
			module = module:sub(1, # module - 5)
		end
		if module:sub(- 4) == ".lua" then
			module = module:sub(1, # module - 4)
		end
		local mod = LBN_MODULES[module];
		if not mod then
			if true then
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
LBN_MODULES["utils/print"] = function ()
	local util = {};
	function util:hello ()
		print("Hello!")
	end
	return util;
end
LBN_MODULES["utils/stats"] = function ()
	local util = {};
	function util:info()
		print("Bundled using luaubundler")
	end
	return util;
end
LBN_MODULES["Main"] = function ()
                --// Showcase of all macros.
	if true then
		print("Currently in debug mode!")
	else
		print("Currently not in debug mode!")
	end
	print("This file was bundled in " .. 6.00 .. "ms using luaubundler " .. 'v1.1.4' .. " at " .. '21/03/2026, 15:22:58');
	print("Within the module " .. 'Main')
	print("The absolute path of this module is " .. 'C:\\Users\\swift\\Desktop\\projects\\node.js\\luaubundler\\example\\Main.luau')
	print("Total number of modules registered: " .. 3)
	print("The files under the utility directory will be output below.")
	for i, v in {
		'print',
		'stats'
	} do
		print(i, v)
	end
	print('===========================================================')
	local json = {
		['a'] = 5,
		['j'] = {
			{
				'hi'
			},
			'4',
			'hello world!',
			5
		}
	};
	local text = [[
	hello world!
]];
	print(text)
	print("The key `a` in the json file's value is: " .. json.a)
	local utils = {
		['print'] = LBN_REQUIRE('utils/print'),
		['stats'] = LBN_REQUIRE('utils/stats'),
	};
	utils.stats:info()
	print("Out of the scope of the debug guard")
	print("2/2")
end
LBN_REQUIRE("Main")