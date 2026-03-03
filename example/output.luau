--[[
	Bundled using Luaubundler v1.1.1
	Github repo: https://github.com/swiftdev/luaubundler
	Discord: https://discord.gg/2aNwJ66MVE
	Build date: 2/2/2026 17:26:57
	Time taken: 5.00ms
--]]

local L_1_ = false
local L_2_ = {};
local L_3_ = {};
local L_4_ = setmetatable({}, {
	__call = function (L_5_arg0, L_6_arg1)
		if L_3_[L_6_arg1] ~= nil then
			return L_3_[L_6_arg1]
		end
		local L_7_ = L_2_[L_6_arg1];
		if not L_7_ then
			if L_1_ then
				error("Missing module " .. L_6_arg1)
			end
			return nil;
		end
		L_3_[L_6_arg1] = true;
		local L_8_ = L_7_();
		L_3_[L_6_arg1] = L_8_
		return L_8_;
	end
});
L_2_["Utility/Math"] = function ()
	local L_9_ = {};
	function L_9_.floor(...)
		return math.floor(...)
	end
	function L_9_.ceil(...)
		return math.ceil(...)
	end
	return L_9_;
end
L_2_["Features/Aimbot"] = function ()
	local L_10_ = {
		Value = false
	};
	function L_10_:Toggle(L_11_arg0)
		L_10_.Value = L_11_arg0;
		if L_11_arg0 then
			print("Aimbot has been enabled!")
		else
			print("Aimbot has been disabled!")
		end
	end
	function L_10_:Status(): boolean
		return L_10_.Value;
	end
	return L_10_;
end
L_2_["Utility/Print"] = function ()
	local L_12_ = L_4_('Utility/Math');
	local L_13_ = L_4_('Features/Aimbot')
	return setmetatable({}, {
		__call = function (L_14_arg0, L_15_arg1)
			print(L_15_arg1)
		end
	})
end
L_2_["Main"] = function ()
	local L_16_ = L_4_('Utility/Print');
	local L_17_ = L_4_('Utility/Math');
	local L_18_ = L_4_('Features/Aimbot');
	L_16_("The result of the floor is: " .. L_17_.floor(5 / 3.5 * 12));
	L_16_("The result of the ceil  is: " .. L_17_.ceil(5 / 3.5 * 12));
	L_18_:Toggle(true);
	L_16_("The current status of the aimbot is: " .. tostring(L_18_:Status()))
	L_18_:Toggle(false);
	L_16_("The current status of the aimbot is: " .. tostring(L_18_:Status()))
end
L_4_("Main")
