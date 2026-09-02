import { AttributeType } from "../enums/enums";
import CalendarIcon from "./CalendarIcon";
import ImageIcon from "./ImageIcon";

function AttributeIcon({ type }: { type: AttributeType }) {
  switch (type) {
    case AttributeType.String:
      return <span>Aa</span>;

    case AttributeType.Text:
      return <span>¶</span>;

    case AttributeType.Image:
      return <ImageIcon />;

    case AttributeType.Numeric:
      return <span>#</span>;

    case AttributeType.Date:
    case AttributeType.Period:
      return <CalendarIcon />;

    case AttributeType.Boolean:
      return <span>✓</span>;

    case AttributeType.Dropdown:
      return <span>☷</span>;

    default:
      return null;
  }
}

export default AttributeIcon;
