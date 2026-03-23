--[[
	Bundled using Luaubundler v1.1.5
	Github repo: https://github.com/swiftdev/luaubundler
	Discord: https://discord.gg/2aNwJ66MVE
	Build date: 23/03/2026, 18:37:30
	Time taken: 5.00ms
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
	local mods = {
		['print'] = LBN_REQUIRE('utils/print'),
		['stats'] = LBN_REQUIRE('utils/stats'),
	};
	mods['print']:hello()
end
LBN_REQUIRE("Main")