package com.ssafy.insite.common.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum UserType {
    @JsonProperty("user") USER,
    @JsonProperty("planner") PLANNER
}
