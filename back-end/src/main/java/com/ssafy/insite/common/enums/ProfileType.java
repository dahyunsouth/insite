package com.ssafy.insite.common.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ProfileType {
    @JsonProperty("default") DEFAULT,
    @JsonProperty("fox") FOX,
    @JsonProperty("chick") chick,
    @JsonProperty("dog") DOG,
    @JsonProperty("cat") CAT,
    @JsonProperty("rabbit") RABBIT,
    @JsonProperty("panda") PANDA
}
