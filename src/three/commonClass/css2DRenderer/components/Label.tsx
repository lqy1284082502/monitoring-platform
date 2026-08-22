import './Label.less';
interface IProps {
    name: string;
}
function Label(props: IProps) {
    return (
        <div className="label-container">
            <div>立方体：{props.name}</div>
            <div>长：2mm</div>
            <div>宽：2mm</div>
            <div>高：2mm</div>
        </div>
    );
}

export default Label;
