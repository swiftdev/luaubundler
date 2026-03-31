--[[
	Bundled using Luaubundler v1.1.6
	Github repo: https://github.com/swiftdev/luaubundler
	Discord: https://discord.gg/2aNwJ66MVE
	Build date: 31/03/2026, 21:25:25
	Time taken: 2.00ms
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
			if false then
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
LBN_MODULES["Main"] = function ()
	local data = {
		['AbsolutePath'] = 'C:\\Users\\swift\\Desktop\\projects\\node.js\\luaubundler\\example\\utils\\print.luau',
		['RelativePath'] = 'utils\\print.luau',
		['FileName'] = 'print.luau',
		['Extension'] = 'luau',
		['Size'] = 122,
		['LastModified'] = 'Tue Mar 31 2026 21:08:43 GMT+0100 (British Summer Time)',
		['Dependencies'] = {
			'utils/print'
		},
	}
	print(data);
end
LBN_REQUIRE("Main")