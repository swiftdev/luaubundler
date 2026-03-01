return setmetatable({}, {
    __call = function (this, message)
        print(message)
    end 
})