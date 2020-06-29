
When specifying requirements:
    Notice the relative meaning of "forPlayer" and "forOpponent".

    When inside "whenResolvedAddAlso" of "forOpponent", your position has changed.
    Specs inside that reference "forPlayer" is referencing "forOpponent" relative to the upper level.
    forOpponent (player 2)
        whenResolvedAddAlso:
            forOpponent (player 1)
                whenResolvedAddAlso:
                    forOpponent (player 2)
                    forPlayer (player1)
            forPlayer (player 2)
    forPlayer (player 1)

    The exception is ifAddedAddAlso. Here the meanings are not changed. This is because of technical reasons.
    forOpponent (player 2)
            ifAddedAddAlso:
                forOpponent (player 2)
                    ifAddedAddAlso:
                        forOpponent (player 2)
                        forPlayer (player 1)
                forPlayer (player 1)
        forPlayer (player 1)
