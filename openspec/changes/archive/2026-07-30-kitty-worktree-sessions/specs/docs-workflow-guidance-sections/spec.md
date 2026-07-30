## ADDED Requirements

### Requirement: Documentation provides a discoverable managed Kitty workflow
The documentation SHALL provide dedicated, discoverable guidance for Arashi's automatic managed Kitty worktree sessions and SHALL keep command references, integration navigation, troubleshooting, and agent-readable exports aligned.

#### Scenario: User evaluates Kitty integration
- **WHEN** a user opens integrations or terminal workflow guidance
- **THEN** they can discover a focused Kitty workflow explaining Kitty 0.43+, permitted remote control, automatic precedence, exact live-session reuse, and readable worktree labels
- **AND** can follow links to the relevant switch and create command references

#### Scenario: User configures or troubleshoots remote control
- **WHEN** managed Kitty version, executable, permission, password, socket, focus, launch, lock, duplicate-state, or validation handling fails
- **THEN** canonical guidance explains the actionable prerequisite or recovery boundary
- **AND** does not recommend weakening Kitty security policy, inventing environment markers, attaching to an arbitrary socket, or retrying through another launcher

#### Scenario: User asks about persistence or removal
- **WHEN** a user needs Kitty session restoration or removes an Arashi worktree with a live Kitty window
- **THEN** documentation states that this slice uses temporary live sessions, does not write `.kitty-session` files, and does not close Kitty windows during `arashi remove`

#### Scenario: Agent-readable exports include Kitty guidance
- **WHEN** documentation validation regenerates or checks agent-readable exports
- **THEN** exported switch, create, configuration, and Kitty workflow guidance contains the same version, precedence, reuse, failure, persistence, and ownership semantics as canonical pages
