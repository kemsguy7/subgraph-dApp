import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { EmergencyWithdrawn } from "../generated/schema"
import { EmergencyWithdrawn as EmergencyWithdrawnEvent } from "../generated/KMS/KMS"
import { handleEmergencyWithdrawn } from "../src/kms"
import { createEmergencyWithdrawnEvent } from "./kms-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let amount = BigInt.fromI32(234)
    let penalty = BigInt.fromI32(234)
    let timestamp = BigInt.fromI32(234)
    let newTotalStaked = BigInt.fromI32(234)
    let newEmergencyWithdrawnEvent = createEmergencyWithdrawnEvent(
      user,
      amount,
      penalty,
      timestamp,
      newTotalStaked
    )
    handleEmergencyWithdrawn(newEmergencyWithdrawnEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("EmergencyWithdrawn created and stored", () => {
    assert.entityCount("EmergencyWithdrawn", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amount",
      "234"
    )
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "penalty",
      "234"
    )
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "timestamp",
      "234"
    )
    assert.fieldEquals(
      "EmergencyWithdrawn",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newTotalStaked",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
