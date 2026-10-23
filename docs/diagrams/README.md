# PlantText UML diagrams

The `.puml` files are the editable diagram sources. Open [PlantText](https://www.planttext.com/) and import a source file to view or edit it. Each diagram follows PlantUML syntax. The global use case diagram follows the user-supplied actor and feature list.

The matching `.png` files are the figures included in `rapport-chapitres.tex`. The global class and use-case PNGs were supplied as image diagrams and replace earlier rendered exports; their `.puml` files are older editable versions and do not reproduce these images. Keep this distinction in mind when editing or regenerating the figures.

The global use case diagram is limited to functions supported by declared backend routes and records relevant access-control limitations in its legend. Profile editing, persistent calendar management, subscription billing, and order/payment endpoints are not exposed by the API observed in this repository. Stripe operations exist in the order service, but the orders controller declares no routes. JWT guards do not check an administrator role. Adaptive coaching uses backend rules; it is not an external AI actor.

`classes-global.puml` is a global overview of selected Prisma models and declared relations. The remaining class diagrams detail the model groups for training, commerce, program structure, enrollment, and progression. Profile and subscription fields belong to `User`; separate `Profile` and `Subscription` models are not defined. The implementation views show selected fields and declared Prisma relations. The backend has no repository layer, and JWT-protected write routes do not enforce an administrator role.
